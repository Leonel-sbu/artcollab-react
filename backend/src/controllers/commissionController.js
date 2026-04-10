const Commission = require("../models/Commission");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/* ----------------------------- LIST COMMISSIONS ----------------------------- */
// Public: list all commission services with filters
exports.list = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      featured,
      artistId,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isService: true }; // Only show service listings

    // Apply filters
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (artistId) query.artist = artistId;
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query['pricing.basic.price'] = {};
      if (minPrice) query['pricing.basic.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.basic.price'].$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const commissions = await Commission.find(query)
      .populate("artist", "name email")
      .populate("buyer", "name email")
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Commission.countDocuments(query);

    res.json({
      success: true,
      items: commissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error("List commissions error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- LIST MY SERVICES ----------------------------- */
// Get services created by the logged-in artist
exports.myServices = async (req, res) => {
  try {
    const commissions = await Commission.find({
      artist: req.user.id,
      isService: true
    })
      .populate("artist", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, items: commissions });
  } catch (err) {
    console.error("My services error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- LIST MY BOOKINGS ----------------------------- */
// Get commissions where user is the buyer
exports.myBookings = async (req, res) => {
  try {
    const commissions = await Commission.find({ buyer: req.user.id })
      .populate("artist", "name email")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, items: commissions });
  } catch (err) {
    console.error("My bookings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET BY ID ---------------------------------- */
exports.getById = async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate("artist", "name email")
      .populate("buyer", "name email");

    if (!commission) {
      return res.status(404).json({ success: false, message: "Commission not found" });
    }

    res.json({ success: true, item: commission });
  } catch (err) {
    console.error("Get commission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- CREATE SERVICE --------------------------- */
// Artist creates a service listing
exports.createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      images,
      pricing,
      budget,
      currency,
      tags,
      deliveryDays,
      revisions,
      features,
      featured
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    // Process features and tags from comma-separated strings
    const processedFeatures = features ? features.split(',').map(f => f.trim()).filter(f => f) : [];
    const processedTags = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

    const commission = await Commission.create({
      buyer: req.user.id,
      artist: req.user.id,
      title,
      description: description || "",
      category: category || "illustration",
      images: images || [],
      image: req.file ? `/uploads/services/${req.file.filename}` : null,
      pricing: pricing || {},
      budget: budget || 0,
      currency: currency || "ZAR",
      tags: processedTags,
      deliveryDays: deliveryDays || 7,
      revisions: revisions || 3,
      features: processedFeatures,
      featured: featured || false,
      isService: true,
      status: "requested"
    });

    await commission.populate("artist", "name email");

    res.status(201).json({ success: true, item: commission });
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- BOOK COMMISSION --------------------------- */
// Customer books/requests a commission from an artist
exports.book = async (req, res) => {
  try {
    const { title, description, budget, referenceFiles, pricingTier } = req.body;
    const serviceId = req.params.id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    // Look up the service to get the artist (avoids requiring artistId in the body)
    const service = await Commission.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const artistId = service.artist;

    // Prevent self-booking
    if (artistId.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot book your own service" });
    }

    // Create new commission request
    const commission = await Commission.create({
      buyer: req.user.id,
      artist: artistId,
      title,
      description: description || "",
      budget: budget || 0,
      referenceFiles: referenceFiles || [],
      pricing: pricingTier || {},
      isService: false,
      status: "requested"
    });

    // Create notification for artist
    await Notification.create({
      recipient: artistId,
      sender: req.user.id,
      type: "commission",
      message: `New commission request: ${title}`,
    });

    // Create or find conversation between buyer and artist
    const conversation = await Conversation.findOrCreate(
      [req.user.id, artistId],
      'commission',
      { resourceType: 'commission', resourceId: commission._id }
    );

    await commission.populate("artist", "name email");
    await commission.populate("buyer", "name email");

    // Send an automatic opening message from the buyer so the chat is not empty
    const openingText = `Hi! I just booked your service "${service.title}". Looking forward to discussing the details with you!`;
    const initMsg = await Message.create({
      conversationId: conversation._id,
      sender: req.user.id,
      text: openingText,
      status: 'sent',
    });
    await conversation.updateLastMessage(initMsg);
    // Increment unread for artist so they see the new message
    await conversation.incrementUnread(artistId);

    res.json({ success: true, item: commission, conversationId: conversation._id });
  } catch (err) {
    console.error("Book commission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- UPDATE SERVICE ------------------------- */
exports.updateService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      images,
      pricing,
      budget,
      currency,
      tags,
      deliveryDays,
      revisions,
      features,
      featured,
      status
    } = req.body;

    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check ownership
    if (commission.artist.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Update fields
    if (title) commission.title = title;
    if (description !== undefined) commission.description = description;
    if (category) commission.category = category;
    if (images) commission.images = images;
    if (pricing) commission.pricing = pricing;
    if (budget !== undefined) commission.budget = budget;
    if (currency) commission.currency = currency;
    if (tags) commission.tags = tags;
    if (deliveryDays) commission.deliveryDays = deliveryDays;
    if (revisions) commission.revisions = revisions;
    if (features) commission.features = features;
    if (featured !== undefined) commission.featured = featured;
    if (status && (req.user.role === "admin" || commission.artist.toString() === req.user.id)) {
      commission.status = status;
    }

    await commission.save();
    await commission.populate("artist", "name email");
    await commission.populate("buyer", "name email");

    res.json({ success: true, item: commission });
  } catch (err) {
    console.error("Update service error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- UPDATE BOOKING STATUS ------------------------- */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({ success: false, message: "Commission not found" });
    }

    // Check ownership
    const isBuyer = commission.buyer.toString() === req.user.id;
    const isArtist = commission.artist.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isArtist && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    commission.status = status;
    await commission.save();

    // Notify the other party
    const notifyUser = isBuyer ? commission.artist : commission.buyer;
    await Notification.create({
      recipient: notifyUser,
      sender: req.user.id,
      type: "commission",
      message: `Commission "${commission.title}" status updated to: ${status}`,
    });

    await commission.populate("artist", "name email");
    await commission.populate("buyer", "name email");

    res.json({ success: true, item: commission });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- DELETE SERVICE ------------------------- */
exports.remove = async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check ownership
    if (commission.artist.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Commission.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    console.error("Delete service error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET CATEGORIES ------------------------- */
exports.getCategories = async (req, res) => {
  const categories = [
    { id: "portrait", name: "Portraits", icon: "👤" },
    { id: "landscape", name: "Landscapes", icon: "🏞️" },
    { id: "digital", name: "Digital Art", icon: "💻" },
    { id: "traditional", name: "Traditional Art", icon: "🎨" },
    { id: "3d", name: "3D Art", icon: "🎲" },
    { id: "animation", name: "Animation", icon: "🎬" },
    { id: "nft", name: "NFT Art", icon: "🔷" },
    { id: "logo", name: "Logo Design", icon: "📌" },
    { id: "illustration", name: "Illustrations", icon: "✏️" },
    { id: "other", name: "Other", icon: "🎭" }
  ];

  res.json({ success: true, categories });
};

/* ----------------------------- GET STATS ------------------------- */
exports.getStats = async (req, res) => {
  try {
    const Commission = require('../models/Commission');

    const totalServices = await Commission.countDocuments({ status: 'published' });
    const totalBookings = await Commission.countDocuments({ booking: { $exists: true, $ne: null } });
    const totalRevenue = await Commission.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      success: true, stats: {
        totalServices,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
