// routes/passwordRoutes.js
const express = require('express');
const {
  forgotPassword,
  verifyOtp,
  updatePassword
} = require('../controllers/passwordController');

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.put('/update-password', updatePassword); // Changed to PUT

module.exports = router;
