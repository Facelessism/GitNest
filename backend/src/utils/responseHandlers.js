/**
 * Send standardized success response
 * Format: { success: true, message: string, data: any }
 */
export const sendSuccess = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send paginated success response
 * Format: { success: true, message: string, data: array, pagination: object }
 */
export const sendPaginated = (res, statusCode, data, pagination, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Send error response (used by error handler)
 * Format: { success: false, message: string, errors?: array }
 */
export const sendError = (res, statusCode, message, errors = null) => {
  const errorResponse = {
    success: false,
    message,
  };

  if (errors && Array.isArray(errors) && errors.length > 0) {
    errorResponse.errors = errors;
  }

  res.status(statusCode).json(errorResponse);
};

