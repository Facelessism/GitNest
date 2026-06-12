import { param, body } from 'express-validator';

const usernameValidator = param('username')
  .trim()
  .notEmpty().withMessage('Username is required')
  .isLength({ min: 1, max: 39 }).withMessage('Username must be between 1 and 39 characters')
  .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, hyphens and underscores');

const repoNameValidator = param('repoName')
  .trim()
  .notEmpty().withMessage('Repository name is required')
  .isLength({ min: 1, max: 100 }).withMessage('Repository name must be between 1 and 100 characters')
  .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Repository name can only contain letters, numbers, hyphens and underscores');

const branchNamePattern = /^[a-zA-Z0-9_\-./]+$/;

export const fetchBranchesValidator = [
  usernameValidator,
  repoNameValidator,
];

export const createBranchValidator = [
  usernameValidator,
  repoNameValidator,
  body('branchName')
    .trim()
    .notEmpty().withMessage('Branch name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Branch name must be between 1 and 100 characters')
    .matches(branchNamePattern).withMessage('Branch name can only contain letters, numbers, hyphens, underscores, dots and slashes'),
];

export const checkoutBranchValidator = [
  usernameValidator,
  repoNameValidator,
  body('branchName')
    .trim()
    .notEmpty().withMessage('Branch name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Branch name must be between 1 and 100 characters')
    .matches(branchNamePattern).withMessage('Branch name can only contain letters, numbers, hyphens, underscores, dots and slashes'),
];

export const deleteBranchValidator = [
  usernameValidator,
  repoNameValidator,
  param('branchName')
    .trim()
    .notEmpty().withMessage('Branch name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Branch name must be between 1 and 100 characters')
    .matches(branchNamePattern).withMessage('Branch name can only contain letters, numbers, hyphens, underscores, dots and slashes'),
];