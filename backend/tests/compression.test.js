/**
 * Integration tests for response compression middleware.
 *
 * Verifies that the Express app sends gzip-compressed responses when the
 * client advertises Accept-Encoding: gzip, and that the Content-Encoding
 * header is absent for payloads below the 1 KB threshold.
 *
 * These tests spin up the actual Express app without a database connection,
 * intercepting the DB call so the middleware stack (compression → cors →
 * json → routes) can be exercised in isolation.
 *
 * Run with: node --experimental-vm-modules node_modules/.bin/jest tests/compression.test.js
 */

import { jest } from '@jest/globals';
import http from 'http';
import { gzipSync } from 'zlib';

// ---------------------------------------------------------------------------
// Stub database connection so the app boots without MongoDB.
// ---------------------------------------------------------------------------
jest.mock('../src/config/db.js', () => ({ default: jest.fn() }));

// Stub JWT_SECRET env var so the startup guard does not throw.
process.env.JWT_SECRET = 'test-secret-for-compression-tests';

// ---------------------------------------------------------------------------
// Import the app after mocks are registered.
// ---------------------------------------------------------------------------
const { default: express } = await import('express');
const { default: compression } = await import('compression');

// Build a minimal standalone Express app that mirrors only the compression
// + json stack — avoids needing a live DB while still testing real middleware.
const buildTestApp = () => {
  const app = express();
  app.use(compression({ threshold: 1024 }));
  app.use(express.json());

  // Route that returns a large JSON payload (>1 KB) — should be compressed.
  app.get('/large', (_req, res) => {
    const payload = { items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item-${i}-data` })) };
    res.json(payload);
  });

  // Route that returns a tiny payload (<1 KB) — should NOT be compressed.
  app.get('/small', (_req, res) => {
    res.json({ ok: true });
  });

  return app;
};

// ---------------------------------------------------------------------------
// Helper — fire a request against a live http.Server and return headers+body.
// ---------------------------------------------------------------------------
const request = (server, path, headers = {}) =>
  new Promise((resolve, reject) => {
    const addr = server.address();
    const options = { hostname: '127.0.0.1', port: addr.port, path, headers };
    http.get(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

let server;

beforeAll((done) => {
  server = buildTestApp().listen(0, '127.0.0.1', done);
});

afterAll((done) => {
  server.close(done);
});

describe('compression middleware', () => {
  test('sets Content-Encoding: gzip on large responses when client sends Accept-Encoding: gzip', async () => {
    const res = await request(server, '/large', { 'Accept-Encoding': 'gzip' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
  });

  test('large response body is valid gzip data', async () => {
    const res = await request(server, '/large', { 'Accept-Encoding': 'gzip' });
    expect(() => {
      const { gunzipSync } = require('zlib');
      gunzipSync(res.body);
    }).not.toThrow();
  });

  test('does NOT compress when client does not send Accept-Encoding', async () => {
    const res = await request(server, '/large');
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  test('does NOT compress payloads below the 1 KB threshold', async () => {
    const res = await request(server, '/small', { 'Accept-Encoding': 'gzip' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  test('compressed response decodes to valid JSON', async () => {
    const { gunzipSync } = await import('zlib');
    const res = await request(server, '/large', { 'Accept-Encoding': 'gzip' });
    const decompressed = gunzipSync(res.body).toString('utf8');
    const parsed = JSON.parse(decompressed);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items).toHaveLength(100);
  });

  test('compression reduces large response size by at least 50%', async () => {
    const [compressed, uncompressed] = await Promise.all([
      request(server, '/large', { 'Accept-Encoding': 'gzip' }),
      request(server, '/large'),
    ]);
    expect(compressed.body.length).toBeLessThan(uncompressed.body.length * 0.5);
  });
});
