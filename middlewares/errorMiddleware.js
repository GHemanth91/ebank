/**
 * Global error handling middleware
 * Catches errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Check if the error is a validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  // Check if the error is a database error
  if (err.code && (err.code.startsWith('ER_') || err.code.startsWith('SQLITE_'))) {
    return res.status(500).json({
      error: 'Database Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred with the database'
    });
  }

  // Check if the error is a JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // For API routes, return JSON
  if (req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      error: 'Server Error',
      message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred'
    });
  }
  
  // For web routes, render an error page or redirect
  if (statusCode === 404) {
    return res.status(404).render('error', { 
      title: '404 - Not Found',
      message: 'The page you are looking for does not exist'
    });
  }
  
  return res.status(statusCode).render('error', {
    title: 'Error',
    message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred'
  });
};

/**
 * 404 Not Found middleware
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
