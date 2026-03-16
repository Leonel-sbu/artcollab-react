/**
 * Standardized Error Handler Middleware
 * Provides consistent API error responses
 */

module.exports = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Default status code
  let status = err.statusCode || 500;

  // Error message
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    const validationMessages = Object.values(err.errors).map(e => e.message).join(', ');
    message = `Validation error: ${validationMessages}`;
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    status = 409;
    // Extract duplicate field from error message
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate ${field}. This value already exists.`;
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal server error';
  }

  // Standardized response format
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * API Response Helpers
 * Standardized success/error responses for controllers
 */
const apiResponse = {
  success: (res, data, message = 'Success', status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data
    });
  },

  created: (res, data, message = 'Created successfully') => {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = 'Error', status = 400, errors = null) => {
    return res.status(status).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  },

  notFound: (res, resource = 'Resource') => {
    return res.status(404).json({
      success: false,
      message: `${resource} not found`
    });
  },

  unauthorized: (res, message = 'Unauthorized') => {
    return res.status(401).json({
      success: false,
      message
    });
  },

  forbidden: (res, message = 'Forbidden') => {
    return res.status(403).json({
      success: false,
      message
    });
  },

  conflict: (res, message = 'Conflict') => {
    return res.status(409).json({
      success: false,
      message
    });
  }
};

module.exports.apiResponse = apiResponse;
