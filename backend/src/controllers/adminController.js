const User       = require('../models/User');
const Artwork    = require('../models/Artwork');
const Course     = require('../models/Course');
const Order      = require('../models/Order');
const Report     = require('../models/Report');
const Enrollment = require('../models/Enrollment');

exports.stats = async (req, res) => {
  const [users, artworks, courses, orders, openReports] = await Promise.all([
    User.countDocuments(),
    Artwork.countDocuments(),
    Course.countDocuments(),
    Order.countDocuments(),
    Report.countDocuments({ status: { $in: ['open', 'reviewing'] } })
  ]);

  res.json({
    success: true,
    stats: { users, artworks, courses, orders, openReports }
  });
};

exports.listUsers = async (req, res) => {
  // Pagination: ?page=1&limit=20
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments()
  ]);

  res.json({
    success: true,
    items,
    pagination: {
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    }
  });
};

exports.pendingArtworks = async (req, res) => {
  const items = await Artwork.find({ status: 'pending' })
    .populate('artist', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ success: true, items });
};

exports.setArtworkStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['published', 'pending', 'rejected', 'draft'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const item = await Artwork.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Artwork not found' });

  item.status = status;
  await item.save();

  res.json({ success: true, item });
};

exports.listReports = async (req, res) => {
  const items = await Report.find()
    .populate('reporter', 'name email role')
    .sort({ createdAt: -1 })
    .limit(500);

  res.json({ success: true, items });
};

exports.setReportStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['open', 'reviewing', 'resolved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const item = await Report.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Report not found' });

  item.status = status;
  await item.save();

  res.json({ success: true, item });
};

// ========== USER MANAGEMENT ==========

exports.updateUserRole = async (req, res) => {
  const { role } = req.body || {};
  const validRoles = ['admin', 'artist', 'buyer', 'learner'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent self-demotion (admin cannot remove their own admin role)
  if (req.user._id.toString() === user._id.toString() && user.role === 'admin' && role !== 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot remove your own admin role' });
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated from '${previousRole}' to '${role}'`,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Prevent self-deletion
  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'User deleted successfully' });
};

// ========== COURSE MANAGEMENT ==========

exports.listAllCourses = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

exports.setCourseStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['draft', 'published', 'archived'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const item = await Course.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Course not found' });

  item.status = status;
  await item.save();

  res.json({ success: true, item });
};

// ========== ORDER MANAGEMENT ==========

exports.listAllOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// ========== ENROLLMENT / STUDENT MANAGEMENT ==========

exports.listEnrollments = async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.courseId) filter.course = req.query.courseId;
  if (req.query.userId)   filter.user   = req.query.userId;

  const [items, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('user',   'name email')
      .populate('course', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

exports.removeEnrollment = async (req, res) => {
  const item = await Enrollment.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Enrollment not found' });

  await Enrollment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Enrollment removed' });
};
