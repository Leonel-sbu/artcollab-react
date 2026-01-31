const Artwork = require('../models/Artwork');

exports.list = async (req, res) => {
  const items = await Artwork.find()
    .populate('artist', 'name role')
    .sort({ createdAt: -1 });

  res.json({ success: true, items });
};

exports.getById = async (req, res) => {
  const item = await Artwork.findById(req.params.id).populate('artist', 'name role');
  if (!item) return res.status(404).json({ success: false, message: 'Artwork not found' });
  res.json({ success: true, item });
};

exports.create = async (req, res) => {
  const { title, description, price, imageUrl, status } = req.body || {};
  if (!title) return res.status(400).json({ success: false, message: 'title is required' });

  const item = await Artwork.create({
    title: title.trim(),
    description: description || '',
    price: typeof price === 'number' ? price : Number(price || 0),
    imageUrl: imageUrl || '',
    status: status || 'published',
    artist: req.user.id
  });

  res.status(201).json({ success: true, item });
};

exports.update = async (req, res) => {
  const item = await Artwork.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Artwork not found' });

  // ownership check
  if (item.artist.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { title, description, price, imageUrl, status } = req.body || {};

  if (title !== undefined) item.title = String(title).trim();
  if (description !== undefined) item.description = String(description);
  if (price !== undefined) item.price = typeof price === 'number' ? price : Number(price);
  if (imageUrl !== undefined) item.imageUrl = String(imageUrl);
  if (status !== undefined) item.status = String(status);

  await item.save();
  res.json({ success: true, item });
};

exports.remove = async (req, res) => {
  const item = await Artwork.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Artwork not found' });

  if (item.artist.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await item.deleteOne();
  res.json({ success: true, message: 'Artwork deleted' });
};
