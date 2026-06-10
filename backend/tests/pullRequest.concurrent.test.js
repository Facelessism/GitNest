import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

process.env.JWT_SECRET = 'test_jwt_secret_concurrent';
process.env.NODE_ENV = 'test';

const REPO_ID    = 'aaaabbbbccccddddeeee0000';
const AUTHOR_ID  = 'aaaabbbbccccddddeeee0001';

// ── mocks ──────────────────────────────────────────────────────────────────

let prCounter = 0;
const createdPRs = [];

const mockRepoFindByIdAndUpdate = jest.fn(async (_id, update) => {
  prCounter += 1;
  return { prCount: prCounter };
});

const mockRepoFindById = jest.fn(async () => ({
  _id: { toString: () => REPO_ID },
  name: 'test-repo',
  owner: AUTHOR_ID,
  defaultBranch: 'main',
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findById:           mockRepoFindById,
    findOne:            jest.fn(),
    findByIdAndUpdate:  mockRepoFindByIdAndUpdate,
  },
}));

jest.unstable_mockModule('../src/models/PullRequest.model.js', () => ({
  default: {
    create: jest.fn(async (data) => {
      const doc = { ...data, _id: `pr-${data.number}` };
      createdPRs.push(doc);
      return doc;
    }),
    findById: jest.fn(async (id) => createdPRs.find(p => p._id === id)),
    findOne:  jest.fn(async () => null),
    find:     jest.fn(),
    populate: jest.fn().mockReturnThis(),
  },
}));

jest.unstable_mockModule('../src/utils/asyncHandler.js', () => ({
  default: (fn) => fn,
}));

jest.unstable_mockModule('../src/utils/AppError.js', () => ({
  default: class AppError extends Error {
    constructor(msg, code) { super(msg); this.statusCode = code; }
  },
}));

jest.unstable_mockModule('../src/utils/responseHandlers.js', () => ({
  sendSuccess: jest.fn((res, status, data) => res.json({ status, data })),
}));

// stub remaining deps used by the controller module
for (const mod of [
  '../src/services/saga/sagaOrchestrator.js',
  '../src/events/eventEmitter.js',
  '../src/services/branchProtectionEvaluator.service.js',
  '../src/utils/paginate.js',
]) {
  jest.unstable_mockModule(mod, () => ({ default: { executeSaga: jest.fn(), emit: jest.fn(), evaluate: jest.fn() } }));
}

// ── helpers ────────────────────────────────────────────────────────────────

const makeReq = () => ({
  body: {
    repositoryId: REPO_ID,
    title:        'Concurrent PR',
    sourceBranch: 'feature',
    targetBranch: 'main',
  },
  user: { _id: AUTHOR_ID },
});

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ── tests ──────────────────────────────────────────────────────────────────

describe('createPullRequest — concurrent number assignment', () => {
  beforeEach(() => {
    prCounter = 0;
    createdPRs.length = 0;
    jest.clearAllMocks();
  });

  test('all concurrent requests receive unique, sequential PR numbers', async () => {
    const { createPullRequest } = await import('../src/controllers/pullRequest.controller.js');

    const N = 10;
    const requests = Array.from({ length: N }, () => {
      const res = makeRes();
      return createPullRequest(makeReq(), res).then(() => res);
    });

    const responses = await Promise.all(requests);

    // All must have called res.json (i.e. succeeded)
    responses.forEach(res => expect(res.json).toHaveBeenCalled());

    // $inc must have been called exactly N times
    expect(mockRepoFindByIdAndUpdate).toHaveBeenCalledTimes(N);
    expect(
      mockRepoFindByIdAndUpdate.mock.calls.every(
        ([, update]) => update?.$inc?.prCount === 1
      )
    ).toBe(true);

    // All generated PR numbers must be unique
    const numbers = createdPRs.map(pr => pr.number);
    expect(new Set(numbers).size).toBe(N);

    // Numbers must be 1–N
    expect(numbers.sort((a, b) => a - b)).toEqual(
      Array.from({ length: N }, (_, i) => i + 1)
    );
  });
});