import { param } from 'express-validator';

export const fileBrowserValidator = [
    param('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 1, max: 39 }).withMessage('Username must be between 1 and 39 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, hyphens and underscores'),

    param('repoName')
    .trim()
    .notEmpty().withMessage('Repository name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Repository name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Repository name can only contain letters, numbers, hyphens and underscores'),
];