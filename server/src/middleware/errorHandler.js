const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`An account with this ${field} already exists`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token has expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  const response = {
    success: false,
    message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(env.isDevelopment() && { stack: err.stack }),
  };

  // Log all errors in development, or server errors in production
  if (env.isDevelopment() || statusCode >= 500) {
    console.error(`[Error] ${statusCode} ${req.method} ${req.path} - ${message}`);
    if (env.isDevelopment()) {
      console.error('[Error] Stack:', err.stack);
    }
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
