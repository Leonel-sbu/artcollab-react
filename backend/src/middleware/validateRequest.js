/**
 * Request Validation Middleware
 * Uses express-validator for input validation
 */
const { validationResult } = require('express-validator');

/**
 * Validates request using express-validator rules
 * Must be placed after validation rules in route definition
 */
module.exports = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        let message = 'Validation failed';
        const isRegisterRoute = req.originalUrl && req.originalUrl.startsWith('/api/auth/register');
        if (isRegisterRoute && formattedErrors.length > 0) {
            message = formattedErrors[0].message;
        }

        return res.status(400).json({
            success: false,
            message,
            errors: formattedErrors
        });
    }

    next();
};
