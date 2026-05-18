import { sendError } from '../utils/responseHandlers.js';

/**
 * Centralized error handling middleware
 * Normalizes different error types and sends consistent response format
 * Handles MongoDB, JWT, validation, and operational errors
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Handle Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle JWT expiration
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired, please log in again';
  }

  // Handle JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token, please log in again';
  }

  // Send standardized error response
  if (process.env.NODE_ENV === 'development') {
    sendError(res, statusCode, message, errors);
    if (err.stack) {
      console.error('[ERROR STACK]', err.stack);
    }
  } else {
    sendError(res, statusCode, message, errors);
  }
};

export default errorHandler;
