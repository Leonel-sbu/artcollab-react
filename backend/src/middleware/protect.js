/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Checks both Admin and User collections
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

/**
 * Extract JWT token from Authorization header or cookie
 */
function getTokenFromHeader(req) {
    // First try Authorization header
    const auth = req.headers.authorization || req.headers.Authorization;
    if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
        return auth.slice('Bearer '.length).trim();
    }
    // Fall back to cookie (for httpOnly cookie auth)
    return req.cookies?.auth_token || null;
}

/**
 * Protect middleware - verifies JWT and attaches user
 * Usage: router.get('/', protect, handler)
 */
const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = getTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify JWT secret exists and is strong enough
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }
        if (secret.length < 32) {
            console.error('JWT_SECRET must be at least 32 characters');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Verify and decode token
        const decoded = jwt.verify(token, secret);

        const userId = decoded?.id || decoded?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User ID not found.'
            });
        }

        // Fetch user from database (check Admin collection first, then User collection)
        let user = await Admin.findById(userId).select(
            '-passwordHash -resetPasswordToken -resetPasswordExpires'
        );

        let isAdmin = false;

        if (!user) {
            // Check regular users
            user = await User.findById(userId).select(
                '-passwordHash -resetPasswordToken -resetPasswordExpires'
            );
        } else {
            isAdmin = true;
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Account may have been deleted.'
            });
        }

        // Attach user to request and flag if admin
        req.user = user;
        req.user.isAdmin = isAdmin;
        // Also set role for easier access in controllers
        if (isAdmin) {
            req.user.role = 'admin';
        }
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

module.exports = { protect, getTokenFromHeader };
