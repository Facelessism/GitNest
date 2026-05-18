import { body } from 'express-validator';

/**
 * Update profile validation rules
 * Bio: max 500 characters
 * Location: max 100 characters
 * Website: valid URL format
 * AvatarUrl: valid URL format
 */
export const updateProfileValidator = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),

  body('avatarUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];
