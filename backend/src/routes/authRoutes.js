const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const c = require("../controllers/authController");
const { protect } = require("../middleware/protect");
const { loginRateLimiter } = require("../middleware/rateLimiter");
const { authLimiter, passwordResetLimiter } = require("../config/rateLimits");
const validateRequest = require("../middleware/validateRequest");

// Validation rules
const registerValidation = [
    body('name').exists().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role')
        .optional()
        .custom((value) => {
            const normalized = String(value).trim().toLowerCase();
            const validRoles = ['admin', 'artist', 'buyer', 'learner'];
            if (!validRoles.includes(normalized)) {
                throw new Error('Invalid role. Must be one of: admin, artist, buyer, learner');
            }
            return true;
        }),
];

const requireRegisterFields = (req, res, next) => {
    const { name, email, password } = req.body || {};

    if (name === undefined || name === null || name === '' ||
        email === undefined || email === null || email === '' ||
        password === undefined || password === null || password === '') {
        return res.status(400).json({
            success: false,
            message: 'name, email, password are required',
            errors: []
        });
    }

    next();
};

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.get("/", (req, res) => res.json({ success: true, module: "auth" }));

router.post("/register", authLimiter, requireRegisterFields, registerValidation, validateRequest, c.register);
router.post("/login", loginValidation, validateRequest, loginRateLimiter, c.login);
router.post("/logout", c.logout);
router.get("/me", protect, c.me);

router.post("/forgot-password", passwordResetLimiter, forgotPasswordValidation, validateRequest, c.forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPasswordValidation, validateRequest, c.resetPassword);

module.exports = router;
