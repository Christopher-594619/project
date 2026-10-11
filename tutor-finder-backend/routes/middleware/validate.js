import { validationResult, body, param, query } from 'express-validator';
import { AppError } from './errorHandler.js';

export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const errorMessages = errors.array().map(err => err.msg);
        throw new AppError(errorMessages.join(', '), 400);
    };
};

// Common validation rules
export const validators = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be between 3 and 50 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain at least one number'),
        body('fullName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Full name must be between 2 and 100 characters')
    ],
    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Invalid email address'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    updateProfile: [
        body('fullName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Full name must be between 2 and 100 characters'),
        body('bio')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Bio must not exceed 500 characters'),
        body('country')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Country name must not exceed 50 characters')
    ],
    createSong: [
        body('title')
            .trim()
            .isLength({ min: 2, max: 200 })
            .withMessage('Title must be between 2 and 200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        body('genreId')
            .optional()
            .isInt()
            .withMessage('Invalid genre ID'),
        body('language')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Language must not exceed 50 characters'),
        body('releaseDate')
            .optional()
            .isISO8601()
            .withMessage('Invalid release date format')
    ],
    createPlaylist: [
        body('title')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Title must be between 2 and 100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters'),
        body('isPublic')
            .optional()
            .isBoolean()
            .withMessage('isPublic must be a boolean')
    ],
    comment: [
        body('content')
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage('Comment must be between 1 and 1000 characters')
    ]
};