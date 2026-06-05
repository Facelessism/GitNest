import Repository from '../models/Repository.model.js';

import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';

import { cloneRepository } from '../services/clone.service.js';

export const cloneExternalRepository = asyncHandler(
  async (req, res, next) => {
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
      return next(
        new AppError(
          'Repository URL is required',
          400
        )
      );
    }

    const { repoName } =
      await cloneRepository(
        repositoryUrl,
        req.user.id
      );

    const existingRepository =
      await Repository.findOne({
        owner: req.user.id,
        name: repoName,
      });

    if (existingRepository) {
      return next(
        new AppError(
          'Repository already exists',
          400
        )
      );
    }

    const repository =
      await Repository.create({
        name: repoName,
        owner: req.user.id,
        visibility: 'public',
        sourceUrl: repositoryUrl,
      });

    sendSuccess(
      res,
      201,
      repository,
      'Repository cloned successfully'
    );
  }
);	
