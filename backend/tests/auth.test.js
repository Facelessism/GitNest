import request from 'supertest';
import app from '../src/app.js';

const validUser = {
  username: 'testuser',
  email: 'testuser@gitnest.com',
  password: 'Password123',
};

describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('should return 400 if email already exists', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'anotheruser',
        email: validUser.email,
        password: validUser.password,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if username already exists', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: validUser.username,
        email: 'different@gitnest.com',
        password: validUser.password,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if username is too short (less than 3 chars)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'ab',
        email: 'shortname@gitnest.com',
        password: validUser.password,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if password has no uppercase letter', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'uppercaseuser',
        email: 'uppercaseuser@gitnest.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login successfully and return a token', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUser.email,
        password: 'WrongPassword123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'missing@gitnest.com',
        password: validUser.password,
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'notanemail',
        password: validUser.password,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return current user when valid token is provided', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password,
      });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.password).toBeUndefined();
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when token is invalid/malformed', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Additional Registration Edge Cases', () => {
  it('should reject extremely long username', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'a'.repeat(256),
        email: 'longuser@gitnest.com',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject password without numbers', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'nonumberuser',
        email: 'nonumber@gitnest.com',
        password: 'PasswordOnly',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject empty string fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: '',
        email: '',
        password: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Additional Login Edge Cases', () => {
  it('should reject empty email and password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: '',
        password: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login request with missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUser.email,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login request with missing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        password: validUser.password,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Additional Protected Route Security Tests', () => {
  it('should reject authorization header without Bearer prefix', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'invalidtoken');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject empty Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer ');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject completely malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', '###@@@');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Security & Response Validation', () => {
  it('should not expose password in registration response', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'secureuser',
        email: 'secureuser@gitnest.com',
        password: 'Password123',
      });

    expect(res.body.data.password).toBeUndefined();
  });

  it('should not expose password in login response', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'secureloginuser',
        email: 'securelogin@gitnest.com',
        password: 'Password123',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'securelogin@gitnest.com',
        password: 'Password123',
      });

    expect(res.body.data.password).toBeUndefined();
  });
});