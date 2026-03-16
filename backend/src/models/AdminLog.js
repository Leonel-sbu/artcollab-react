/**
 * Admin Audit Log Model
 * Tracks all admin actions for security and accountability
 */

const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    // Who performed the action
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },

    // What action was performed
    action: {
        type: String,
        required: true,
        enum: [
            'user_created',
            'user_deleted',
            'user_role_changed',
            'artwork_approved',
            'artwork_rejected',
            'artwork_deleted',
            'report_resolved',
            'report_dismissed',
            'course_created',
            'course_updated',
            'course_deleted',
            'order_refunded',
            'settings_changed',
            'login_success',
            'login_failed',
            'permission_denied'
        ]
    },

    // Target of the action (user, artwork, etc.)
    targetType: {
        type: String,
        enum: ['user', 'artwork', 'report', 'course', 'order', 'settings', 'session']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    targetEmail: String,  // For user actions

    // Details about the change
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,

    // Context
    ipAddress: String,
    userAgent: String,

    // Status
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: String
}, {
    timestamps: true
});

// Index for efficient querying
adminLogSchema.index({ admin: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);
