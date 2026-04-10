const User = require("../models/User");
const Artwork = require("../models/Artwork");
const Order = require("../models/Order");
const Commission = require("../models/Commission");
const Course = require("../models/Course");

exports.getStats = async (req, res) => {
  try {
    // Return empty stats for unauthenticated users
    if (!req.user) {
      return res.json({
        success: true,
        data: {
          totalArtworks: 0,
          totalSalesZAR: 0,
          totalOrders: 0,
          followers: 0
        }
      });
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    // If admin, show global stats
    if (userRole === 'admin') {
      const [totalArtworks, totalOrders, totalCommissions, totalCourses] = await Promise.all([
        Artwork.countDocuments({ status: 'published' }),
        Order.countDocuments({ status: 'paid' }),
        Commission.countDocuments({ booking: { $exists: true, $ne: null } }),
        Course.countDocuments()
      ]);

      const totalRevenue = await Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$subtotal' } } }
      ]);

      return res.json({
        success: true,
        data: {
          totalArtworks,
          totalSalesZAR: totalRevenue[0]?.total || 0,
          totalOrders,
          totalCommissions,
          totalCourses,
          followers: 0 // Admin doesn't have followers
        }
      });
    }

    // For regular users, show their personal stats + global published artworks
    const [userArtworks, allPublishedArtworks, orders, user] = await Promise.all([
      Artwork.find({ artist: userId, status: 'published' }),
      Artwork.find({ status: 'published' }),
      Order.find({ user: userId }).populate('items.artwork', null, null, { strictPopulate: false }),
      User.findById(userId).select('followers')
    ]);

    // Calculate total sales (ZAR) from paid orders
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalSalesZAR = paidOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);

    const followers = user?.followers?.length || 0;

    res.json({
      success: true,
      data: {
        // Show BOTH user's artworks AND total published artworks
        totalArtworks: userArtworks.length,
        totalPublishedArtworks: allPublishedArtworks.length,
        totalSalesZAR,
        totalOrders: paidOrders.length,
        followers
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};
