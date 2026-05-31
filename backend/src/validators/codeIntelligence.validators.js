import { param, query } from 'express-validator';
import { repoParamValidator } from './repository.validators.js';

export const indexIdValidator = [
  ...repoParamValidator,
  param('indexId')
    .trim()
    .notEmpty()
    .withMessage('Index ID is required')
    .isUUID()
    .withMessage('Index ID must be a valid UUID'),
];

export const symbolSearchValidator = [
  ...repoParamValidator,
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('symbolType')
    .optional()
    .isIn(['function', 'class', 'export', 'import', 'route'])
    .withMessage('Invalid symbol type'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

export const symbolDetailValidator = [
  ...repoParamValidator,
  param('symbolId')
    .trim()
    .notEmpty()
    .withMessage('Symbol ID is required')
    .isMongoId()
    .withMessage('Symbol ID must be a valid Mongo ID'),
];
