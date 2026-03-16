/**
 * Input Sanitization Middleware
 * Uses xss library to prevent XSS attacks
 */
const xss = require('xss');

/**
 * Sanitize a string value
 * Removes HTML tags and escapes special characters
 */
const sanitizeString = (value) => {
    if (typeof value === 'string') {
        return xss(value.trim());
    }
    return value;
};

/**
 * Sanitize an object recursively
 * Useful for sanitizing request body
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
};

/**
 * Middleware to sanitize request body
 */
const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};

/**
 * Sanitize specific fields only (more targeted approach)
 * Use this for fields that allow some HTML but not scripts
 */
const sanitizeFields = (fields) => {
    return (req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            for (const field of fields) {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    req.body[field] = sanitizeString(req.body[field]);
                }
            }
        }
        next();
    };
};

module.exports = {
    sanitizeString,
    sanitizeObject,
    sanitizeBody,
    sanitizeFields
};
