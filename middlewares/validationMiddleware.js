const { body, validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 * @param {Array} validations - Array of express-validator validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Return validation errors
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  };
};

/**
 * Common validation rules for user registration
 */
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Common validation rules for user login
 */
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username or email is required'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

/**
 * Common validation rules for account creation
 */
const accountValidation = [
  body('type')
    .trim()
    .notEmpty().withMessage('Account type is required')
    .isIn(['checking', 'savings', 'investment']).withMessage('Invalid account type')
];

/**
 * Common validation rules for transactions
 */
const transactionValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  
  body('type')
    .trim()
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['deposit', 'withdrawal', 'transfer', 'payment']).withMessage('Invalid transaction type'),
  
  body('description')
    .trim()
    .optional()
    .isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
];

/**
 * Common validation rules for transfer
 */
const transferValidation = [
  body('fromAccountId')
    .trim()
    .notEmpty().withMessage('Source account is required'),
  
  body('toAccountId')
    .trim()
    .notEmpty().withMessage('Destination account is required'),
  
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  
  body('description')
    .trim()
    .optional()
    .isLength({ max: 255 }).withMessage('Description must be less than 255 characters')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  accountValidation,
  transactionValidation,
  transferValidation
};
