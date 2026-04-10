/**
 * CSRF Protection Middleware
 * Uses the csrf package (not the deprecated csurf)
 *
 * KEY DESIGN RULE:
 *   Only /api/csrf-token issues a new secret+token pair.
 *   All other GET requests pass through WITHOUT touching the cookie.
 *   If every GET regenerated a new secret, any token obtained from
 *   /api/csrf-token would be invalidated by the very next GET request
 *   (e.g., fetching the community feed) — which was the original bug.
 */
const csrf = require('csrf');

const tokens = new csrf();

// Routes that skip CSRF entirely (auth entry-points + read-only infra)
const exemptRoutes = [
    '/api/csrf-token',           // token endpoint is the only place that issues tokens
    '/api/payments/webhook',     // Stripe verifies its own signature
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/logout',
];

const COOKIE_OPTIONS = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        // 'none' required in production for cross-origin requests (same as auth cookie)
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
    };
};

/**
 * GET /api/csrf-token
 * Always issues a fresh secret+token pair.
 */
const getCsrfToken = (req, res) => {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    res.cookie('csrf-secret', secret, COOKIE_OPTIONS());
    res.json({ csrfToken: token });
};

/**
 * verifyCsrf — call this on state-changing routes that need protection.
 * Reads the token from the X-CSRF-Token header (or _csrf body field)
 * and the secret from the csrf-secret httpOnly cookie.
 */
const verifyCsrf = (req, res, next) => {
    const token = req.headers['x-csrf-token'] || req.body?._csrf;
    const secret = req.cookies?.['csrf-secret'];

    if (!token || !secret) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token missing. Fetch a token from GET /api/csrf-token first.',
        });
    }

    if (!tokens.verify(secret, token)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token. Please refresh the page and try again.',
        });
    }

    next();
};

/**
 * Global CSRF middleware registered via app.use().
 *
 * GET  requests → always pass through (no regeneration, no verification)
 * POST/PUT/PATCH/DELETE without an auth cookie → pass through
 *   (unauthenticated requests cannot exploit CSRF meaningfully)
 * POST/PUT/PATCH/DELETE with an auth cookie → verify CSRF token
 */
module.exports = function csrfMiddleware(req, res, next) {
    const isExempt = exemptRoutes.some(route => req.path.startsWith(route));
    if (isExempt) return next();

    // Read-only — no need for CSRF
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    // Only enforce CSRF for authenticated sessions
    const hasAuthCookie = !!(req.cookies?.auth_token);
    const hasAuthHeader = !!(req.headers?.authorization);
    if (!hasAuthCookie && !hasAuthHeader) {
        return next();
    }

    return verifyCsrf(req, res, next);
};

module.exports.getCsrfToken = getCsrfToken;
module.exports.verifyCsrf = verifyCsrf;
