/**
 * Rate Limiting Configuration
 * Centralized rate limit definitions for different endpoint types
 */
const rateLimit = require('express-rate-limit');

// General API rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Password reset limiter (stricter)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: {
        success: false,
        message: 'Too many password reset requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Messaging limiter
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 messages per minute
    message: {
        success: false,
        message: 'Too many messages, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Upload limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
        success: false,
        message: 'Too many uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Admin actions limiter
const adminLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 admin actions per minute
    message: {
        success: false,
        message: 'Too many admin actions, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Review/report creation limiter
const reviewCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 reviews per hour
    message: {
        success: false,
        message: 'Too many reviews, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    messageLimiter,
    uploadLimiter,
    adminLimiter,
    reviewCreationLimiter
};
