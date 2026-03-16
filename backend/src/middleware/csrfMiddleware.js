/**
 * CSRF Protection Middleware
 * Wraps csurf but exempts certain routes
 */
const csrf = require("csurf");

// Routes that don't need CSRF protection
// These are authentication entry points - users can't have CSRF token before authenticating
const exemptRoutes = [
    '/api/csrf-token',               // Token endpoint must be public
    '/api/payments/webhook',         // Stripe handles its own verification
    '/api/health',                   // Health check doesn't modify state
    '/api/auth/login',               // Auth entry point - no prior token
    '/api/auth/register',            // Auth entry point - no prior token
    '/api/auth/forgot-password',     // Auth entry point - no prior token
    '/api/auth/reset-password',      // Auth entry point - no prior token
    '/api/auth/logout',              // Users need to logout without having a CSRF token
];

// Create CSRF protection with cookie storage
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

module.exports = function csrfMiddleware(req, res, next) {
    // Skip CSRF for exempt routes
    const isExempt = exemptRoutes.some(route => req.path.startsWith(route));

    if (isExempt) {
        return next();
    }

    // Apply CSRF protection to all other routes
    csrfProtection(req, res, next);
};

module.exports.csrfProtection = csrfProtection;
