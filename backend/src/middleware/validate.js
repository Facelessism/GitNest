import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/**
 * Express-validator middleware factory
 * Executes all validators and checks for errors
 * Returns structured error format with field-level detail
 * Prevents invalid payloads from reaching controllers
 */
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
      }));

      const appError = new AppError('Validation failed', 400);
      appError.errors = formattedErrors;
      return next(appError);
    }

    next();
  };
};

export default validate;