/**
 * Integration tests for PR listing and retrieval visibility enforcement (issue #339).
 *
 * Scenarios covered:
 *   - Unauthenticated list returns only public-repo PRs
 *   - Authenticated list returns public PRs + caller's own private-repo PRs
 *   - Authenticated list never returns another user's private-repo PRs
 *   - GET /:id on a private-repo PR returns 404 to unauthenticated callers
 *   - GET /:id on a private-repo PR returns 404 to authenticated non-owners
 *   - GET /:id on a private-repo PR succeeds for the repo owner
 *   - GET /:id on a public-repo PR succeeds for any caller (auth or unauth)
 *   - Listing with ?repository= filter on a private repo leaks nothing to non-owners
 *   - Listing with ?repository= filter on a private repo works for the owner
 *   - Empty result set is returned gracefully when no visible repos exist
 */

import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Repository from '../src/models/Repository.model.js';
import PullRequest from '../src/models/PullRequest.model.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const register = async (suffix) => {
  const payload = {
    username: `visuser_${suffix}`,
    email: `visuser_${suffix}@test.com`,
    password: 'Password123!',
  };
  const res = await request(app).post('/api/v1/auth/register').send(payload);
  return { token: res.body.token, body: res.body };
};

const createRepo = async (ownerId, name, visibility = 'public') =>
  Repository.create({ name, owner: ownerId, visibility, defaultBranch: 'main' });

const createPR = async (repoId, authorId, title = 'Test PR') =>
  PullRequest.create({
    number: Math.floor(Math.random() * 999999),
    title,
    description: 'desc',
    repository: repoId,
    author: authorId,
    sourceBranch: 'feat',
    targetBranch: 'main',
    diff: [],
  });

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('PR visibility enforcement', () => {
  let ownerToken, ownerId;
  let strangerToken, strangerId;

  let publicRepo, privateRepo;
  let publicPR, privatePR;

  beforeEach(async () => {
    const ts = Date.now();

    const ownerRes = await register(`own${ts}`);
    ownerToken = ownerRes.token;

    const strangerRes = await register(`str${ts}`);
    strangerToken = strangerRes.token;

    const ownerUser = await User.findOne({ username: `visuser_own${ts}` });
    const strangerUser = await User.findOne({ username: `visuser_str${ts}` });

    ownerId = ownerUser._id;
    strangerId = strangerUser._id;

    publicRepo = await createRepo(ownerId, `pub_${ts}`, 'public');
    privateRepo = await createRepo(ownerId, `priv_${ts}`, 'private');

    publicPR = await createPR(publicRepo._id, ownerId, 'Public PR');
    privatePR = await createPR(privateRepo._id, ownerId, 'Private PR');
  });

  // -------------------------------------------------------------------------
  // List endpoint — unauthenticated
  // -------------------------------------------------------------------------

  describe('GET /api/v1/pull-requests (unauthenticated)', () => {
    test('returns only public-repo PRs', async () => {
      const res = await request(app).get('/api/v1/pull-requests');
      expect(res.status).toBe(200);
      const ids = res.body.data.pullRequests.map((pr) => String(pr._id || pr.id));
      expect(ids).toContain(String(publicPR._id));
      expect(ids).not.toContain(String(privatePR._id));
    });

    test('response shape includes counts and pagination', async () => {
      const res = await request(app).get('/api/v1/pull-requests');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('counts');
      expect(res.body.data).toHaveProperty('pagination');
    });

    test('querying by private repo ID returns empty list, not an error', async () => {
      const res = await request(app)
        .get(`/api/v1/pull-requests?repository=${privateRepo._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.pullRequests).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // List endpoint — authenticated stranger (non-owner)
  // -------------------------------------------------------------------------

  describe('GET /api/v1/pull-requests (authenticated non-owner)', () => {
    test('does not include private-repo PRs owned by another user', async () => {
      const res = await request(app)
        .get('/api/v1/pull-requests')
        .set(authHeader(strangerToken));
      expect(res.status).toBe(200);
      const ids = res.body.data.pullRequests.map((pr) => String(pr._id || pr.id));
      expect(ids).not.toContain(String(privatePR._id));
    });

    test('does include public-repo PRs', async () => {
      const res = await request(app)
        .get('/api/v1/pull-requests')
        .set(authHeader(strangerToken));
      expect(res.status).toBe(200);
      const ids = res.body.data.pullRequests.map((pr) => String(pr._id || pr.id));
      expect(ids).toContain(String(publicPR._id));
    });

    test("querying by another user's private repo ID returns empty list", async () => {
      const res = await request(app)
        .get(`/api/v1/pull-requests?repository=${privateRepo._id}`)
        .set(authHeader(strangerToken));
      expect(res.status).toBe(200);
      expect(res.body.data.pullRequests).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // List endpoint — authenticated owner
  // -------------------------------------------------------------------------

  describe('GET /api/v1/pull-requests (authenticated owner)', () => {
    test('includes both public and own private-repo PRs', async () => {
      const res = await request(app)
        .get('/api/v1/pull-requests')
        .set(authHeader(ownerToken));
      expect(res.status).toBe(200);
      const ids = res.body.data.pullRequests.map((pr) => String(pr._id || pr.id));
      expect(ids).toContain(String(publicPR._id));
      expect(ids).toContain(String(privatePR._id));
    });

    test('querying by own private repo ID returns PRs in that repo', async () => {
      const res = await request(app)
        .get(`/api/v1/pull-requests?repository=${privateRepo._id}`)
        .set(authHeader(ownerToken));
      expect(res.status).toBe(200);
      const ids = res.body.data.pullRequests.map((pr) => String(pr._id || pr.id));
      expect(ids).toContain(String(privatePR._id));
    });

    test("stranger's private-repo PRs are never included in owner's list", async () => {
      const ts = Date.now();
      const strangerPrivateRepo = await createRepo(strangerId, `spriv_${ts}`, 'private');
      const strangerPrivatePR = await createPR(strangerPrivateRepo._id, strangerId, 'Stranger private');

      const res = await request(app)
        .get('/api/v1/pull-requests')
        .set(authHeader(ownerToken));
      const ids = res.body.data.pullRequests.map((pr) => String(pr._id || pr.id));
      expect(ids).not.toContain(String(strangerPrivatePR._id));
    });
  });

  // -------------------------------------------------------------------------
  // Get single PR — visibility checks
  // -------------------------------------------------------------------------

  describe('GET /api/v1/pull-requests/:id', () => {
    test('unauthenticated caller can fetch a public-repo PR', async () => {
      const res = await request(app).get(`/api/v1/pull-requests/${publicPR._id}`);
      expect(res.status).toBe(200);
    });

    test('unauthenticated caller receives 404 for a private-repo PR', async () => {
      const res = await request(app).get(`/api/v1/pull-requests/${privatePR._id}`);
      expect(res.status).toBe(404);
    });

    test('authenticated non-owner receives 404 for a private-repo PR', async () => {
      const res = await request(app)
        .get(`/api/v1/pull-requests/${privatePR._id}`)
        .set(authHeader(strangerToken));
      expect(res.status).toBe(404);
    });

    test('repo owner can fetch their own private-repo PR', async () => {
      const res = await request(app)
        .get(`/api/v1/pull-requests/${privatePR._id}`)
        .set(authHeader(ownerToken));
      expect(res.status).toBe(200);
      expect(String(res.body.data._id || res.body.data.id)).toBe(String(privatePR._id));
    });

    test('authenticated non-owner can fetch a public-repo PR', async () => {
      const res = await request(app)
        .get(`/api/v1/pull-requests/${publicPR._id}`)
        .set(authHeader(strangerToken));
      expect(res.status).toBe(200);
    });

    test('returns 404 for a completely non-existent PR id', async () => {
      const fakeId = '6'.repeat(24);
      const res = await request(app).get(`/api/v1/pull-requests/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    test('list returns empty result when all repos are private and caller is unauthenticated', async () => {
      await PullRequest.deleteMany({ repository: publicRepo._id });
      await Repository.updateOne({ _id: publicRepo._id }, { visibility: 'private' });

      const res = await request(app).get('/api/v1/pull-requests');
      expect(res.status).toBe(200);
      expect(res.body.data.pullRequests).toHaveLength(0);
      expect(res.body.data.counts).toEqual({ open: 0, closed: 0, merged: 0 });
    });

    test('status filter is applied within the visibility-permitted set', async () => {
      await PullRequest.create({
        number: Math.floor(Math.random() * 999999),
        title: 'Closed public PR',
        description: '',
        repository: publicRepo._id,
        author: ownerId,
        sourceBranch: 'fix',
        targetBranch: 'main',
        status: 'closed',
        diff: [],
      });

      const res = await request(app).get('/api/v1/pull-requests?status=closed');
      expect(res.status).toBe(200);
      const statuses = res.body.data.pullRequests.map((pr) => pr.status);
      expect(statuses.every((s) => s === 'closed')).toBe(true);
    });

    test('unauthenticated caller cannot fetch a PR authored by them in a private repo', async () => {
      const authoredPR = await PullRequest.create({
        number: Math.floor(Math.random() * 999999),
        title: 'Stranger authored PR in private repo',
        description: '',
        repository: privateRepo._id,
        author: strangerId,
        sourceBranch: 'contrib',
        targetBranch: 'main',
        diff: [],
      });

      const res = await request(app).get(`/api/v1/pull-requests/${authoredPR._id}`);
      expect(res.status).toBe(404);
    });

    test('repo owner can fetch a PR in their private repo regardless of who authored it', async () => {
      const authoredPR = await PullRequest.create({
        number: Math.floor(Math.random() * 999999),
        title: 'Stranger authored PR in private repo',
        description: '',
        repository: privateRepo._id,
        author: strangerId,
        sourceBranch: 'contrib',
        targetBranch: 'main',
        diff: [],
      });

      const res = await request(app)
        .get(`/api/v1/pull-requests/${authoredPR._id}`)
        .set(authHeader(ownerToken));
      expect(res.status).toBe(200);
    });
  });
});
