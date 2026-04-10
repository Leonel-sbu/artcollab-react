/**
 * CSRF Protection Middleware
 * Uses the new csrf package (not the deprecated csurf)
 * csrf v3.x API: https://www.npmjs.com/package/csrf
 */
const csrf = require('csrf');

// Create CSRF instance
const tokens = new csrf();

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

/**
 * Generate a CSRF token
 * @returns {object} - { token: string, secret: string }
 */
const generateToken = () => {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    return { token, secret };
};

// Generate CSRF token endpoint
const getCsrfToken = (req, res) => {
    const { token, secret } = generateToken();
    // Store secret in session or cookie (for simplicity, we'll send it as a cookie)
    res.cookie('csrf-secret', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ csrfToken: token });
};

// Middleware to verify CSRF token on state-changing requests
const verifyCsrf = (req, res, next) => {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    const secret = req.cookies['csrf-secret'];

    if (!token || !secret) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing'
        });
    }

    if (!tokens.verify(secret, token)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }

    next();
};

module.exports = function csrfMiddleware(req, res, next) {
    // Skip CSRF for exempt routes
    const isExempt = exemptRoutes.some(route => req.path.startsWith(route));

    if (isExempt) {
        return next();
    }

    // For GET requests, just generate a new token
    if (req.method === 'GET') {
        const { token, secret } = generateToken();
        res.cookie('csrf-secret', secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        req.csrfToken = token;
        return next();
    }

    // For state-changing requests, only verify CSRF when auth credentials are present.
    const hasAuthToken = req.cookies && (req.cookies['auth_token'] || req.headers['authorization']);
    if (!hasAuthToken) {
        return next();
    }

    return verifyCsrf(req, res, next);
};

// Export both middleware functions
module.exports.getCsrfToken = getCsrfToken;
module.exports.verifyCsrf = verifyCsrf;
