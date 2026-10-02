/**
 * =====================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * Catches all unhandled errors and returns user-friendly
 * JSON responses with appropriate HTTP status codes.
 * =====================================================
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('[Error Handler]:', err.stack || err.message);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors);
    const firstMsg = err.errors[fields[0]]?.message || 'Validation failed';
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      field: fields[0],
      message: `Invalid data: ${firstMsg}`,
    });
  }

  // Handle Mongoose duplicate key errors (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      field,
      message: `A record with this ${field} already exists. Please use a different value.`,
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_ID',
      message: `The provided ID "${err.value}" is not valid. Please check and try again.`,
    });
  }

  // Handle JWT errors (should have been caught in auth middleware but just in case)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_INVALID',
      message: 'Invalid authentication token. Please log out and log in again.',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Your session has expired. Please log in again to continue.',
    });
  }

  // Handle request size limit
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'PAYLOAD_TOO_LARGE',
      message: 'The uploaded data is too large. Please reduce the file size and try again.',
    });
  }

  // Handle syntax errors in JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'The request body contains invalid JSON. Please check the data format.',
    });
  }

  // Default error fallback
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: 'SERVER_ERROR',
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later or contact support.'
        : err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorMiddleware;
