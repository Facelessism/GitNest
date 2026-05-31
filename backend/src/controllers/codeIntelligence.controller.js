import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import User from '../models/User.model.js';
import Repository from '../models/Repository.model.js';
import SagaState from '../models/SagaState.model.js';
import IndexedSymbol from '../models/IndexedSymbol.model.js';
import { triggerRepositoryIndex, REPOSITORY_INDEX_TYPE } from '../services/repositoryIndexer.service.js';
import paginate, { buildPaginationMeta } from '../utils/paginate.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveRepository = async ({ username, reponame, userId, requireOwner = false }) => {
  const owner = await User.findOne({ username: username.toLowerCase() });
  if (!owner) throw new AppError('Repository not found', 404);

  const repository = await Repository.findOne({ name: reponame, owner: owner._id });
  if (!repository) throw new AppError('Repository not found', 404);

  const isOwner = userId && repository.owner.toString() === userId;
  if (requireOwner && !isOwner) {
    throw new AppError('Unauthorized access to repository indexing', 403);
  }

  if (repository.visibility === 'private' && !isOwner) {
    throw new AppError('Repository not found', 404);
  }

  return { owner, repository };
};

export const triggerIndexing = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { owner, repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
    requireOwner: true,
  });

  const { indexId } = await triggerRepositoryIndex({
    userId: owner._id,
    repositoryId: repository._id,
    repositoryName: repository.name,
    owner: owner.username,
  });

  sendSuccess(res, 202, { indexId, status: 'processing' }, 'Repository indexing initiated');
});

export const getIndexingStatus = asyncHandler(async (req, res, next) => {
  const { username, reponame, indexId } = req.params;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user.id,
    requireOwner: true,
  });

  const sagaState = await SagaState.findOne({ sagaId: indexId, type: REPOSITORY_INDEX_TYPE });
  if (!sagaState || sagaState.metadata?.repositoryId !== repository._id.toString()) {
    return next(new AppError('Indexing job not found', 404));
  }

  const data = {
    indexId: sagaState.sagaId,
    status: sagaState.status,
    createdAt: sagaState.createdAt,
    updatedAt: sagaState.updatedAt,
    retryCount: sagaState.retryCount,
  };

  if (sagaState.status === 'completed') {
    data.summary = {
      fileCount: sagaState.metadata.fileCount || 0,
      symbolCount: sagaState.metadata.symbolCount || 0,
      indexedAt: sagaState.metadata.indexedAt,
    };
  } else if (sagaState.status === 'rolled_back' || sagaState.status === 'failed') {
    data.error = sagaState.failedStep ? `Failed during step: ${sagaState.failedStep}` : 'Indexing job failed';
  }

  sendSuccess(res, 200, data, 'Repository indexing status retrieved');
});

export const searchSymbols = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { q, symbolType } = req.query;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user?.id,
  });

  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const query = {
    repositoryId: repository._id,
    symbolName: { $regex: escapeRegex(q), $options: 'i' },
  };
  if (symbolType) query.symbolType = symbolType;

  const [symbols, totalCount] = await Promise.all([
    IndexedSymbol.find(query).sort({ symbolName: 1, filePath: 1 }).skip(skip).limit(limit),
    IndexedSymbol.countDocuments(query),
  ]);

  sendSuccess(
    res,
    200,
    { symbols, pagination: buildPaginationMeta(page, limit, totalCount) },
    'Symbols retrieved successfully'
  );
});

export const getSymbolDetails = asyncHandler(async (req, res, next) => {
  const { username, reponame, symbolId } = req.params;
  const { repository } = await resolveRepository({
    username,
    reponame,
    userId: req.user?.id,
  });

  const symbol = await IndexedSymbol.findOne({ _id: symbolId, repositoryId: repository._id });
  if (!symbol) {
    return next(new AppError('Symbol not found', 404));
  }

  sendSuccess(res, 200, symbol, 'Symbol details retrieved');
});
