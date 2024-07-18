const { body } = require('express-validator');
const User = require('../../models/User');
const validatorResult = require('../../middlewares/validatorMiddlewares');

exports.signupValidator = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 4, max: 10 })
    .withMessage('First name must be between 4 and 10 characters'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 4, max: 10 })
    .withMessage('Last name must be between 4 and 10 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('Email already in use');
      }
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long'),

  body('phoneNo')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits long')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),

  validatorResult,
];

exports.loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validatorResult,
];
