const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// JWT secret keys from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate an access token for a user
 * @param {Object} user - User object containing id, username, and role
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object containing id
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * Verify an access token
 * @param {String} token - JWT access token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

/**
 * Verify a refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    console.error('Refresh token verification error:', error.message);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
