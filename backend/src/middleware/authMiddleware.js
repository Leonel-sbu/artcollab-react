// backend/src/middleware/authMiddleware.js
// This file re-exports from protect.js to maintain backward compatibility
// All routes should use middleware from this single source

const { protect, getTokenFromHeader } = require('./protect');
const { authorize } = require('./authorize');

module.exports = { protect, authorize, getTokenFromHeader };
