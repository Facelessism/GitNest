import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/responseHandlers.js';
import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user
 * Token expires in 30 days by default
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Note: Validation middleware (validate.js) ensures required fields and format
  // These checks are defensive and would be caught by validators
  if (!username || !email || !password) {
    return next(new AppError('Please provide username, email and password', 400));
  }

  const lowercaseEmail = email.toLowerCase();
  const lowercaseUsername = username.toLowerCase();

  const userExists = await User.findOne({ $or: [{ email: lowercaseEmail }, { username: lowercaseUsername }] });

  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  const user = await User.create({
    username: lowercaseUsername,
    email: lowercaseEmail,
    password,
  });

  const token = generateToken(user._id);

  sendSuccess(res, 201, {
    _id: user._id,
    username: user.username,
    email: user.email,
    token,
  }, 'User registered successfully');
});

/**
 * @desc    Login user and return JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Note: Validation middleware ensures email is valid and password is present
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  const lowercaseEmail = email.toLowerCase();

  const user = await User.findOne({ email: lowercaseEmail }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken(user._id);

  sendSuccess(res, 200, {
    _id: user._id,
    username: user.username,
    email: user.email,
    token,
  }, 'Logged in successfully');
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private (requires valid JWT token)
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendSuccess(res, 200, user, 'User profile retrieved successfully');
});

