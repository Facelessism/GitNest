import express from 'express';
import { getUserProfile, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { updateProfileValidator } from '../validators/user.validators.js';

const router = express.Router();

/**
 * @route   GET /api/v1/users/:username
 * @desc    Get user profile by ID or username
 * @access  Public
 */
router.get('/:username', getUserProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', protect, validate(updateProfileValidator), updateProfile);

export default router;

