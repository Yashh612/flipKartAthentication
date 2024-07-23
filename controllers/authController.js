// controllers/authController.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { signupValidator, loginValidator } = require('../utils/validators/authValidators');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Signup
exports.signup = [
  ...signupValidator,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, phoneNo } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNo,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNo: user.phoneNo,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  }),
];

// Login
exports.login = [
  ...loginValidator,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password });

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found');
      res.status(401);
      throw new Error('Invalid email or password');
    }

    console.log('User found:', user);

    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (isMatch) {
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNo: user.phoneNo,
        token: generateToken(user._id),
      });
    } else {
      console.log('Invalid password');
      res.status(401);
      throw new Error('Invalid email or password');
    }
  }),
];

// Protect middleware
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
