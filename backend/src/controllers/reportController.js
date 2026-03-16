/**
 * Report Controller
 * Handles report submission and moderation
 */

const Report = require('../models/Report');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const CommunityPost = require('../models/CommunityPost');
const Course = require('../models/Course');
const Commission = require('../models/Commission');

// Helper to validate target exists
async function validateTarget(targetType, targetId) {
    let Model;
    switch (targetType) {
        case 'user':
            Model = User;
            break;
        case 'artwork':
            Model = Artwork;
            break;
        case 'community_post':
            Model = CommunityPost;
            break;
        case 'course':
            Model = Course;
            break;
        case 'commission':
            Model = Commission;
            break;
        case 'message':
            // Messages don't have a separate model, we handle this separately
            return { _id: targetId, exists: true };
        default:
            return null;
    }

    if (!Model) return null;
    return await Model.findById(targetId);
}

// ============================================
// USER REPORT ENDPOINTS
// ============================================

// Submit a new report
exports.createReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetType, targetId, reason, details, evidenceUrls } = req.body;

        // Validate required fields
        if (!targetType || !targetId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'targetType, targetId, and reason are required'
            });
        }

        // Validate target type
        const validTypes = ['user', 'artwork', 'community_post', 'message', 'course', 'commission'];
        if (!validTypes.includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid targetType. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // Validate reason
        const validReasons = [
            'spam', 'harassment', 'hate_speech', 'nudity', 'copyright',
            'fraud', 'scam', 'violence', 'inappropriate', 'misinformation', 'other'
        ];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
            });
        }

        // Check if target exists
        const target = await validateTarget(targetType, targetId);
        if (!target) {
            return res.status(404).json({
                success: false,
                message: `${targetType} not found`
            });
        }

        // Check if user already reported this target
        const existingReport = await Report.hasUserReported(userId, targetType, targetId);
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this content'
            });
        }

        // Can't report yourself
        if (targetType === 'user' && targetId === userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot report yourself'
            });
        }

        // Create report
        const report = await Report.create({
            reporter: userId,
            targetType,
            targetId,
            reason,
            details: details || '',
            evidenceUrls: evidenceUrls || [],
            status: 'pending'
        });

        await report.populate('reporter', 'name email');

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            report
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit report',
            error: error.message
        });
    }
};

// Get current user's reports
exports.getMyReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const reports = await Report.find({ reporter: userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Report.countDocuments({ reporter: userId });

        res.json({
            success: true,
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get my reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
};

// ============================================
// ADMIN REPORT ENDPOINTS
// ============================================

// Get all reports (admin)
exports.adminGetReports = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const reports = await Report.find(query)
            .populate('reporter', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Report.countDocuments(query);

        // Get status counts
        const statusCounts = await Report.getStatusCounts();
        const counts = {};
        statusCounts.forEach(s => { counts[s._id] = s.count; });

        res.json({
            success: true,
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            statusCounts: counts
        });
    } catch (error) {
        console.error('Admin get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
};

// Get a single report (admin)
exports.adminGetReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId)
            .populate('reporter', 'name email')
            .populate('reviewedBy', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Try to populate target info
        let targetInfo = null;
        try {
            const target = await validateTarget(report.targetType, report.targetId);
            if (target) {
                targetInfo = {
                    type: report.targetType,
                    id: report.targetId,
                    exists: true
                };
            }
        } catch (e) {
            // Target might have been deleted
        }

        res.json({
            success: true,
            report,
            targetInfo
        });
    } catch (error) {
        console.error('Admin get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report'
        });
    }
};

// Update report status (admin)
exports.adminUpdateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, adminNotes, resolution } = req.body;
        const adminId = req.user.id;

        // Validate status
        const validStatuses = ['reviewing', 'resolved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Update report
        report.status = status;
        report.adminNotes = adminNotes || report.adminNotes;
        report.resolution = resolution || report.resolution;
        report.reviewedBy = adminId;
        report.reviewedAt = new Date();

        await report.save();
        await report.populate('reporter', 'name email');
        await report.populate('reviewedBy', 'name email');

        res.json({
            success: true,
            message: `Report ${status} successfully`,
            report
        });
    } catch (error) {
        console.error('Admin update report status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report'
        });
    }
};

// Delete old resolved reports (cleanup)
exports.adminDeleteResolved = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        // Use $or to handle both resolved and rejected status
        const result = await Report.deleteMany({
            $or: [
                { status: 'resolved', reviewedAt: { $lt: cutoffDate } },
                { status: 'rejected', reviewedAt: { $lt: cutoffDate } }
            ]
        });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} old reports`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Admin delete resolved reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reports'
        });
    }
};
