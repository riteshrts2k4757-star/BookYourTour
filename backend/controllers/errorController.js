const AppError = require('./../utils/appError');

const convertDatabaseError = err => {
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
  }
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'value';
    return new AppError(`Duplicate ${duplicatedField}. Please use another value.`, 400);
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(error => error.message);
    return new AppError(`Invalid input data. ${messages.join('. ')}`, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Your token has expired. Please log in again.', 401);
  }
  return err;
};

module.exports = (err, req, res, next) => {
  const error = convertDatabaseError(err);
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const response = {
    status,
    message: process.env.NODE_ENV === 'production' && !error.isOperational
      ? 'Something went wrong. Please try again later.'
      : error.message
  };
  if (process.env.NODE_ENV !== 'production') response.stack = error.stack;
  if (statusCode >= 500) console.error('Request failed:', error);
  return res.status(statusCode).json(response);
};
