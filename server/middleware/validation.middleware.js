const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

// Password validation rules
const passwordRules = () => {
    return body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)');
};

// Email validation
const emailRules = () => {
    return body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim();
};

// Username validation
const usernameRules = () => {
    return body('username')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
        .trim();
};

// Name validation
const nameRules = (field) => {
    return body(field)
        .isLength({ min: 2, max: 50 }).withMessage(`${field} must be between 2 and 50 characters`)
        .matches(/^[a-zA-Z\s'-]+$/).withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`)
        .trim();
};

// Message validation
const messageRules = () => {
    return body('message')
        .notEmpty().withMessage('Message cannot be empty')
        .isLength({ max: 5000 }).withMessage('Message is too long (max 5000 characters)')
        .trim();
};

// Signup validation
const signupValidation = [
    emailRules(),
    passwordRules(),
    usernameRules(),
    nameRules('firstName'),
    nameRules('lastName'),
    validate
];

// Login validation
const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail().trim(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Message validation
const messageValidation = [
    messageRules(),
    validate
];

// Contact form validation
const contactValidation = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail().trim(),
    body('subject').notEmpty().withMessage('Subject is required').trim(),
    body('message').notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message too long').trim(),
    validate
];

module.exports = {
    validate,
    signupValidation,
    loginValidation,
    messageValidation,
    contactValidation,
    passwordRules,
    emailRules,
    usernameRules,
    nameRules,
    messageRules
};
