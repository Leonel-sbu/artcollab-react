/**
 * Admin Audit Logger Utility
 * Helper functions to log admin actions
 */

const AdminLog = require('../models/AdminLog');

/**
 * Log an admin action
 * @param {Object} params - Log parameters
 * @param {Object} params.admin - Admin user object (from req.user)
 * @param {string} params.action - Action type (see AdminLog schema)
 * @param {string} params.targetType - Type of target (user, artwork, etc.)
 * @param {Object} params.targetId - MongoDB ID of target
 * @param {string} params.targetEmail - Email of target user (for user actions)
 * @param {Object} params.previousValue - Previous value before change
 * @param {Object} params.newValue - New value after change
 * @param {Object} params.req - Express request object (for IP, user agent)
 * @param {boolean} params.success - Whether action succeeded
 * @param {string} params.errorMessage - Error message if failed
 */
async function logAdminAction({
    admin,
    action,
    targetType = null,
    targetId = null,
    targetEmail = null,
    previousValue = null,
    newValue = null,
    req = null,
    success = true,
    errorMessage = null
}) {
    try {
        const logEntry = {
            admin: admin._id,
            adminEmail: admin.email,
            action,
            targetType,
            targetId,
            targetEmail,
            previousValue,
            newValue,
            ipAddress: req?.ip || req?.connection?.remoteAddress || null,
            userAgent: req?.headers?.['user-agent'] || null,
            success,
            errorMessage
        };

        await AdminLog.create(logEntry);
    } catch (error) {
        // Don't let logging errors break the main operation
        console.error('Failed to create admin log:', error.message);
    }
}

// Shorthand functions for common admin actions
const adminLogger = {
    logUserRoleChange: (admin, targetUser, newRole, req) =>
        logAdminAction({
            admin,
            action: 'user_role_changed',
            targetType: 'user',
            targetId: targetUser._id,
            targetEmail: targetUser.email,
            previousValue: targetUser.role,
            newValue: newRole,
            req
        }),

    logUserDelete: (admin, deletedUser, req) =>
        logAdminAction({
            admin,
            action: 'user_deleted',
            targetType: 'user',
            targetId: deletedUser._id,
            targetEmail: deletedUser.email,
            req
        }),

    logArtworkApproval: (admin, artwork, req) =>
        logAdminAction({
            admin,
            action: 'artwork_approved',
            targetType: 'artwork',
            targetId: artwork._id,
            req
        }),

    logArtworkRejection: (admin, artwork, req) =>
        logAdminAction({
            admin,
            action: 'artwork_rejected',
            targetType: 'artwork',
            targetId: artwork._id,
            req
        }),

    logReportResolution: (admin, report, status, req) =>
        logAdminAction({
            admin,
            action: 'report_resolved',
            targetType: 'report',
            targetId: report._id,
            previousValue: report.status,
            newValue: status,
            req
        })
};

module.exports = { logAdminAction, adminLogger };
