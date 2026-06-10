/**
 * Unit tests for the optionalProtect middleware.
 * Isolated from Mongoose/MongoDB — uses mocked User model.
 */

import { jest, describe, test, expect, beforeAll, beforeEach } from '@jest/globals';

process.env.JWT_SECRET = 'test_optional_protect_secret_unit';
process.env.NODE_ENV = 'test';

const USER_ID = 'a1b2c3d4e5f6a1b2c3d4e5f6';

const mockSelectFn = jest.fn();
const mockFindById = jest.fn(() => ({ select: mockSelectFn }));

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: { findById: mockFindById, findOne: jest.fn() },
}));

jest.unstable_mockModule('../src/models/PullRequest.model.js', () => ({
  default: { findById: jest.fn(), findOne: jest.fn() },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: { findById: jest.fn(), findOne: jest.fn() },
}));

let optionalProtect;

beforeAll(async () => {
  const mod = await import('../src/middleware/authMiddleware.js');
  optionalProtect = mod.optionalProtect;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFindById.mockReturnValue({ select: mockSelectFn });
});

const runMiddleware = (mw, req) =>
  new Promise((resolve) => {
    mw(req, {}, (err) => resolve({ req, err }));
  });

const makeReqWithToken = (token) => ({
  headers: { authorization: `Bearer ${token}` },
});

describe('optionalProtect', () => {
  test('calls next() without error when no Authorization header is present', async () => {
    const req = { headers: {} };
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toBeUndefined();
  });

  test('calls next() without error when Authorization header uses Basic scheme', async () => {
    const req = { headers: { authorization: 'Basic somebase64token' } };
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toBeUndefined();
  });

  test('calls next() without error and does not attach user when token is garbage', async () => {
    const req = makeReqWithToken('this.is.not.a.valid.jwt');
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toBeUndefined();
  });

  test('does not reject when JWT is valid but user no longer exists in DB', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: USER_ID }, process.env.JWT_SECRET);
    mockSelectFn.mockResolvedValue(null);

    const req = makeReqWithToken(token);
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toBeUndefined();
  });

  test('attaches req.user when valid token resolves to an existing user', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const fakeUser = { _id: USER_ID, username: 'testuser' };
    const token = jwt.sign({ id: USER_ID }, process.env.JWT_SECRET);
    mockSelectFn.mockResolvedValue(fakeUser);

    const req = makeReqWithToken(token);
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toEqual(fakeUser);
  });

  test('does not reject when JWT_SECRET is missing — treats as unauthenticated', async () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: USER_ID }, savedSecret);

    const req = makeReqWithToken(token);
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toBeUndefined();

    process.env.JWT_SECRET = savedSecret;
  });

  test('does not attach user when token is expired', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign({ id: USER_ID }, process.env.JWT_SECRET, { expiresIn: -1 });

    const req = makeReqWithToken(token);
    const { err } = await runMiddleware(optionalProtect, req);
    expect(err).toBeUndefined();
    expect(req.user).toBeUndefined();
  });
});
