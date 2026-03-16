const User = require("../models/User");
const Artwork = require("../models/Artwork");
const Order = require("../models/Order");

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

    // Get user's artworks and orders
    // FIX: Changed 'buyer' to 'user' to match Order model schema
    const [artworks, orders] = await Promise.all([
      Artwork.find({ artist: userId }),
      Order.find({ user: userId }).populate('items.artwork', null, null, { strictPopulate: false })
    ]);

    // Calculate total sales (ZAR) from paid orders
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalSalesZAR = paidOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);

    // Get user to check followers
    const user = await User.findById(userId).select('followers');
    const followers = user?.followers?.length || 0;

    res.json({
      success: true,
      data: {
        totalArtworks: artworks.length,
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
