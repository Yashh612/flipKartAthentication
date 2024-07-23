// controllers/passwordController.js
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Generate a random 4-digit number
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Create a transporter
let transporter = nodemailer.createTransport({
  host: 'smtp.fastmail.com',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

// Forgot password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const otp = generateOtp();
  const otpTimestamp = Date.now();

  user.otp = otp;
  user.otpTimestamp = otpTimestamp;
  await user.save();

  // Set up email data
  let mailOptions = {
    from: process.env.EMAIL, // sender address
    to: email, // list of receivers
    subject: 'Password Reset OTP', // Subject line
    text: `Your verification code is: ${otp}`, // plain text body
    html: `<b>Your verification code is: ${otp}</b>` // html body
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Error sending email', error });
    }
    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ message: 'OTP sent successfully' });
  });
});

// Verify OTP
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpTimestamp) {
    return res.status(400).json({ message: 'Invalid OTP or email' });
  }

  if (user.isOtpExpired()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (user.otp === parseInt(otp, 10)) {
    user.otp = null; // OTP is verified, remove it from storage
    user.otpTimestamp = null;
    await user.save();
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// Update password
exports.updatePassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  console.log('User found:', user);

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  console.log('New hashed password:', hashedPassword);

  user.password = hashedPassword;
  await user.save();

  const updatedUser = await User.findOne({ email });
  console.log('Updated user:', updatedUser);

  res.status(200).json({ message: 'Password updated successfully' });
});
