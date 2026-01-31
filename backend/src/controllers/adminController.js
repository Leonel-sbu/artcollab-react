const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Report = require('../models/Report');

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
  const items = await User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(500);
  res.json({ success: true, items });
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
