import Repository from '../models/Repository.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import { getCommitHistory } from '../services/commitHistory.service.js';

export const fetchCommitHistory = asyncHandler(
  async (req, res, next) => {
    const { username, repoName } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Find the owner by username
    const owner = await User.findOne({
      username: username.toLowerCase(),
    }).select('_id');

    if (!owner) {
      return next(new AppError('User not found', 404));
    }

    // Find the repository
    const repository = await Repository.findOne({
      owner: owner._id,
      name: repoName,
    });

    if (!repository) {
      return next(new AppError('Repository not found', 404));
    }

    // Block private repos for non-owners
    if (
      repository.visibility === 'private' &&
      (!req.user || req.user._id.toString() !== owner._id.toString())
    ) {
      return next(new AppError('Repository not found', 404));
    }

    const history = await getCommitHistory(
      owner._id.toString(),
      repository.name,
      page,
      limit
    );

    sendSuccess(
      res,
      200,
      history,
      'Commit history fetched successfully'
    );
  }
);