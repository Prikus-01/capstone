const { logger } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Resource not found', code: 'NOT_FOUND' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Resource already exists', code: 'CONFLICT' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
};

const createError = (statusCode, message, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

module.exports = { errorHandler, createError };
