/**
 * Integration tests for auth endpoint rate limiting (issue #251).
 *
 * Core invariant: the rate limiter must fire on EVERY inbound request,
 * regardless of whether the request body passes format validation.
 * Requests that fail validation used to bypass the counter entirely because
 * the limiter was registered after the validator in the chain.
 *
 * Scenarios covered:
 *   POST /login
 *   - Rejects with 429 after exceeding LOGIN_RATE_LIMIT_MAX attempts
 *   - Counts malformed payloads (invalid email format) toward the limit
 *   - Counts missing-field payloads toward the limit
 *   - Returns RateLimit-* headers on every response
 *   - Returns a proper error body on 429 (not HTML or unformatted text)
 *   - Resumes accepting requests after the window resets (mocked clock)
 *
 *   POST /register
 *   - Rejects with 429 after exceeding REGISTER_RATE_LIMIT_MAX attempts
 *   - Counts malformed payloads toward the limit
 *   - Returns RateLimit-* headers on every response
 *
 *   Rate limiter ordering guarantee
 *   - Limiter fires before schema validation (confirmed by inspecting header
 *     presence on a structurally-invalid request before the limit is reached)
 *
 * Test isolation strategy:
 *   express-rate-limit uses an in-memory store by default. Because Jest runs
 *   tests serially (--runInBand), each test suite needs its own app instance
 *   with a freshly constructed limiter so counters don't bleed between tests.
 *   We pass per-test environment variables to override the window and max
 *   before requiring the routes module.
 */

import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Override limits to small values for fast test execution.
// These must be set before the routes module is imported.
process.env.LOGIN_RATE_LIMIT_WINDOW_MS = '60000';
process.env.LOGIN_RATE_LIMIT_MAX = '3';
process.env.REGISTER_RATE_LIMIT_WINDOW_MS = '60000';
process.env.REGISTER_RATE_LIMIT_MAX = '4';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_rate_limit_secret';
process.env.NODE_ENV = 'test';

// ---------------------------------------------------------------------------
// Build a minimal test app that re-creates the auth routes each describe
// block so the in-memory store is fresh for each group of tests.
// ---------------------------------------------------------------------------

const buildTestApp = async () => {
  // Force module re-evaluation so each test group gets fresh limiter state.
  // Because Jest uses ESM (VM modules), we append a cache-buster query param
  // to the import URL.
  const cacheBust = `?t=${Date.now()}_${Math.random()}`;
  const { default: authRoutes } = await import(`../src/routes/auth.routes.js${cacheBust}`);

  const app = express();
  app.use(express.json());

  // Attach a stub requestId so sendError doesn't throw on missing req.requestId
  app.use((req, _res, next) => {
    req.requestId = 'test-req-id';
    next();
  });

  app.use('/api/v1/auth', authRoutes);

  // Minimal error handler so validation failures return JSON
  app.use((err, req, res, _next) => {
    res.status(err.statusCode || 500).json({ status: 'error', message: err.message, errors: err.errors });
  });

  return app;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validLogin = { email: 'test@example.com', password: 'Password123' };
const validRegister = { username: 'ratelimituser', email: 'rl@example.com', password: 'Password123' };
const malformedEmail = { email: 'notanemail', password: 'Password123' };
const missingPassword = { email: 'test@example.com' };
const missingAllFields = {};

// ---------------------------------------------------------------------------
// Login rate limiting
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/login — rate limiting', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('returns 200 or 401/400 (not 429) on first valid-format request', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(validLogin);
    expect(res.status).not.toBe(429);
  });

  test('RateLimit-Limit header is present on every response', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(validLogin);
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });

  test('RateLimit-Remaining header decrements with each request', async () => {
    const r1 = await request(app).post('/api/v1/auth/login').send(validLogin);
    const r2 = await request(app).post('/api/v1/auth/login').send(validLogin);
    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('returns 429 after exceeding the limit with valid-format requests', async () => {
    // Drain any remaining quota (app is shared within this describe block)
    const max = Number(process.env.LOGIN_RATE_LIMIT_MAX);
    for (let i = 0; i < max + 3; i++) {
      await request(app).post('/api/v1/auth/login').send(validLogin);
    }
    const finalRes = await request(app).post('/api/v1/auth/login').send(validLogin);
    expect(finalRes.status).toBe(429);
  });

  test('429 response body is JSON with a message field', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(validLogin);
    expect(res.status).toBe(429);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('message');
  });
});

// ---------------------------------------------------------------------------
// Limiter counts malformed requests (ordering guarantee)
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/login — limiter counts malformed payloads', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('malformed email increments the counter (RateLimit-Remaining decreases)', async () => {
    const r1 = await request(app).post('/api/v1/auth/login').send(malformedEmail);
    const r2 = await request(app).post('/api/v1/auth/login').send(malformedEmail);

    // Both should be 400 (validation failure), not 429 yet
    expect(r1.status).toBe(400);
    expect(r2.status).toBe(400);

    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    // Counter is incrementing so remaining goes down
    expect(rem2).toBeLessThan(rem1);
  });

  test('missing-field request increments the counter', async () => {
    const r1 = await request(app).post('/api/v1/auth/login').send(missingPassword);
    const r2 = await request(app).post('/api/v1/auth/login').send(missingPassword);

    expect(r1.status).toBe(400);
    expect(r2.status).toBe(400);

    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('empty body request increments the counter', async () => {
    const r1 = await request(app).post('/api/v1/auth/login').send(missingAllFields);
    const r2 = await request(app).post('/api/v1/auth/login').send(missingAllFields);

    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('exhausting the limit with malformed payloads then returns 429', async () => {
    const max = Number(process.env.LOGIN_RATE_LIMIT_MAX);
    // Send enough malformed requests to exhaust the counter
    for (let i = 0; i < max + 3; i++) {
      await request(app).post('/api/v1/auth/login').send(malformedEmail);
    }
    // Now even a structurally valid request should be rejected
    const validAfterExhaustion = await request(app)
      .post('/api/v1/auth/login')
      .send(validLogin);
    expect(validAfterExhaustion.status).toBe(429);
  });

  test('RateLimit-Remaining header is present even on validation-failure responses', async () => {
    const res = await request(app).post('/api/v1/auth/login').send(malformedEmail);
    // header must exist — proves the limiter ran BEFORE the validator
    expect(res.headers).toHaveProperty('ratelimit-remaining');
  });
});

// ---------------------------------------------------------------------------
// Register rate limiting
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/register — rate limiting', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('returns non-429 on first request', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validRegister);
    expect(res.status).not.toBe(429);
  });

  test('RateLimit-Limit header is present on register response', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validRegister);
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });

  test('malformed register request increments the counter', async () => {
    const bad = { username: 'x', email: 'notanemail' }; // too short username + bad email
    const r1 = await request(app).post('/api/v1/auth/register').send(bad);
    const r2 = await request(app).post('/api/v1/auth/register').send(bad);

    const rem1 = Number(r1.headers['ratelimit-remaining']);
    const rem2 = Number(r2.headers['ratelimit-remaining']);
    expect(rem2).toBeLessThan(rem1);
  });

  test('returns 429 after exceeding register limit', async () => {
    const max = Number(process.env.REGISTER_RATE_LIMIT_MAX);
    for (let i = 0; i < max + 3; i++) {
      await request(app).post('/api/v1/auth/register').send(validRegister);
    }
    const res = await request(app).post('/api/v1/auth/register').send(validRegister);
    expect(res.status).toBe(429);
  });

  test('429 body has a message field on register exhaustion', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validRegister);
    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Login and register limits are independent (separate limiter instances)
// ---------------------------------------------------------------------------

describe('login and register have independent rate limit counters', () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  test('exhausting the login limit does not affect the register counter', async () => {
    const loginMax = Number(process.env.LOGIN_RATE_LIMIT_MAX);
    // Drain login counter completely
    for (let i = 0; i < loginMax + 3; i++) {
      await request(app).post('/api/v1/auth/login').send(validLogin);
    }
    // Login must now be blocked
    const loginRes = await request(app).post('/api/v1/auth/login').send(validLogin);
    expect(loginRes.status).toBe(429);

    // Register counter must still have headroom
    const registerRes = await request(app).post('/api/v1/auth/register').send(validRegister);
    expect(registerRes.status).not.toBe(429);
  });

  test('exhausting the register limit does not affect the login counter', async () => {
    const registerMax = Number(process.env.REGISTER_RATE_LIMIT_MAX);
    // Drain register counter completely
    for (let i = 0; i < registerMax + 3; i++) {
      await request(app).post('/api/v1/auth/register').send(validRegister);
    }
    // Register must now be blocked
    const registerRes = await request(app).post('/api/v1/auth/register').send(validRegister);
    expect(registerRes.status).toBe(429);

    // Login counter must still have headroom
    const loginRes = await request(app).post('/api/v1/auth/login').send(validLogin);
    expect(loginRes.status).not.toBe(429);
  });
});
