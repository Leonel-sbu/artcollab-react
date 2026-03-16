/**
 * Role-Based Authorization Middleware
 * Checks if user has required role(s)
 * Also checks if user is from Admin collection
 * 
 * Usage:
 * router.get('/', protect, authorize('admin'), handler)
 * router.get('/', protect, authorize('admin', 'moderator'), handler)
 */

const validRoles = ['admin', 'artist', 'buyer', 'learner'];

/**
 * Authorize middleware factory
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is attached (protect middleware should run first)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        // Check if user is admin (from Admin collection)
        if (req.user.isAdmin || req.user.role === 'admin') {
            return next();
        }

        const userRole = req.user.role;

        // Check if role is valid
        if (!userRole || !validRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid user role'
            });
        }

        // Check if user's role is in allowed roles
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        // User is authorized
        next();
    };
};

module.exports = { authorize, validRoles };
