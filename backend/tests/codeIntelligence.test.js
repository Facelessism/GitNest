import request from 'supertest';
import fs from 'fs';
import path from 'path';
import IndexedSymbol from '../src/models/IndexedSymbol.model.js';
import SagaState from '../src/models/SagaState.model.js';
import { extractSymbolsFromContent } from '../src/services/symbolExtractor.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'test-client';
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'test-secret';
process.env.GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost/auth/github/callback';

const { default: app } = await import('../src/app.js');

describe('Repository Code Intelligence', () => {
  let token;
  let userId;
  let symbolId;
  const username = 'indexowner';
  const repoName = 'indexed-repo';

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      username,
      email: 'indexowner@gitnest.com',
      password: 'Password123',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'indexowner@gitnest.com', password: 'Password123' });

    token = loginRes.body.data.token;
    userId = loginRes.body.data._id;

    await request(app)
      .post('/api/v1/repositories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: repoName, visibility: 'public' });

    const repoPath = path.resolve(process.cwd(), 'repositories', userId.toString(), repoName);
    fs.mkdirSync(path.join(repoPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(repoPath, 'node_modules'), { recursive: true });
    fs.writeFileSync(
      path.join(repoPath, 'src', 'api.js'),
      [
        "import express from 'express';",
        "const router = express.Router();",
        'export function listUsers() { return []; }',
        'class UserService {}',
        "router.get('/users', listUsers);",
        'module.exports.health = () => true;',
      ].join('\n')
    );
    fs.writeFileSync(path.join(repoPath, 'node_modules', 'ignored.js'), 'export function ignored() {}');
  });

  afterEach(() => {
    if (userId) {
      const repoPath = path.resolve(process.cwd(), 'repositories', userId.toString(), repoName);
      if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true });
      }
    }
  });

  test('extracts JS/TS symbols with line metadata', () => {
    const symbols = extractSymbolsFromContent(
      [
        "import express from 'express';",
        'export class ApiClient {}',
        'export const handler = () => {};',
        "app.post('/login', handler);",
      ].join('\n'),
      'src/server.ts'
    );

    expect(symbols).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbolType: 'import', symbolName: 'express', line: 1 }),
        expect.objectContaining({ symbolType: 'class', symbolName: 'ApiClient', line: 2 }),
        expect.objectContaining({ symbolType: 'export', symbolName: 'handler', line: 3 }),
        expect.objectContaining({ symbolType: 'route', symbolName: 'POST /login', line: 4 }),
      ])
    );
  });

  test('indexing saga rebuilds symbols cleanly', async () => {
    const triggerRes = await request(app)
      .post(`/api/v1/repositories/${username}/${repoName}/index`)
      .set('Authorization', `Bearer ${token}`);

    expect(triggerRes.statusCode).toBe(202);
    const { indexId } = triggerRes.body.data;

    let statusRes;
    for (let i = 0; i < 10; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      statusRes = await request(app)
        .get(`/api/v1/repositories/${username}/${repoName}/index/status/${indexId}`)
        .set('Authorization', `Bearer ${token}`);
      if (statusRes.body.data.status === 'completed') break;
    }

    expect(statusRes.body.data.status).toBe('completed');
    expect(statusRes.body.data.summary.symbolCount).toBeGreaterThanOrEqual(5);

    const state = await SagaState.findOne({ sagaId: indexId });
    expect(state.retryCount).toBe(0);

    const symbols = await IndexedSymbol.find({ repositoryName: repoName });
    expect(symbols.map((symbol) => symbol.symbolName)).toContain('listUsers');
    expect(symbols.map((symbol) => symbol.symbolName)).not.toContain('ignored');
  });

  test('symbol search and detail APIs return indexed symbols', async () => {
    const triggerRes = await request(app)
      .post(`/api/v1/repositories/${username}/${repoName}/index`)
      .set('Authorization', `Bearer ${token}`);

    for (let i = 0; i < 10; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const state = await SagaState.findOne({ sagaId: triggerRes.body.data.indexId });
      if (state?.status === 'completed') break;
    }

    const searchRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/symbols/search?q=list&symbolType=function`);

    expect(searchRes.statusCode).toBe(200);
    expect(searchRes.body.data.symbols.length).toBe(1);
    symbolId = searchRes.body.data.symbols[0]._id;

    const detailRes = await request(app)
      .get(`/api/v1/repositories/${username}/${repoName}/symbols/${symbolId}`);

    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.body.data.symbolName).toBe('listUsers');
    expect(detailRes.body.data.filePath).toBe('src/api.js');
  });
});
