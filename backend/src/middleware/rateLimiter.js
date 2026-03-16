/**
 * Simple Rate Limiter Middleware
 * Provides brute-force protection for login and other endpoints
 * 
 * Note: For production with multiple servers, use Redis-based rate limiting
 */

// In-memory store (reset on server restart)
// In production, use Redis or similar
const rateLimitStore = new Map();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean every minute

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @param {string} options.keyGenerator - Function to generate key from request
 */
const rateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes default
        maxRequests = 5, // 5 attempts
        message = 'Too many attempts. Please try again later.',
        keyGenerator = (req) => req.ip || req.connection.remoteAddress
    } = options;

    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();

        // Get or create entry
        let entry = rateLimitStore.get(key);

        if (!entry || now > entry.resetTime) {
            // New window
            entry = {
                count: 1,
                resetTime: now + windowMs,
                firstAttempt: now
            };
            rateLimitStore.set(key, entry);
            return next();
        }

        // Increment count
        entry.count++;

        // Check if over limit
        if (entry.count > maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

            res.status(429).json({
                success: false,
                message,
                retryAfter, // seconds until reset
                limit: maxRequests,
                window: Math.ceil(windowMs / 1000)
            });
            return;
        }

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': maxRequests - entry.count,
            'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000)
        });

        next();
    };
};

/**
 * Pre-configured rate limiters
 */

// Strict limiter for login (5 attempts per 15 minutes)
const loginRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    keyGenerator: (req) => {
        // Combine IP with email for more granular limiting
        const email = req.body?.email || 'unknown';
        return `${req.ip}:${email}`;
    }
});

// Moderate limiter for general API (100 requests per minute)
const apiRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.'
});

// Strict limiter for admin endpoints (60 requests per minute)
const adminRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many admin requests. Please slow down.'
});

module.exports = {
    rateLimiter,
    loginRateLimiter,
    apiRateLimiter,
    adminRateLimiter
};
