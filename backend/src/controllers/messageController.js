const Message = require('../models/Message');
const User = require('../models/User');

// list chats (grouped by "other user")
exports.listChats = async (req, res) => {
  const myId = req.user.id;

  const msgs = await Message.find({ participants: myId })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('sender', 'name role')
    .populate('participants', 'name role');

  // group by "other participant" (1:1 chat)
  const map = new Map();
  for (const m of msgs) {
    const other = (m.participants || []).find(p => p._id.toString() !== myId);
    if (!other) continue;

    const key = other._id.toString();
    if (!map.has(key)) {
      map.set(key, {
        user: { id: other._id, name: other.name, role: other.role },
        lastMessage: { text: m.text, at: m.createdAt, fromMe: m.sender?._id?.toString() === myId }
      });
    }
  }

  res.json({ success: true, chats: Array.from(map.values()) });
};

// get messages with a user
exports.getThread = async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.userId;

  const items = await Message.find({ participants: { $all: [myId, otherId] } })
    .sort({ createdAt: 1 })
    .limit(500)
    .populate('sender', 'name role');

  res.json({ success: true, items });
};

// send message to a user
exports.send = async (req, res) => {
  const myId = req.user.id;
  const { toUserId, text } = req.body || {};

  if (!toUserId || !text) {
    return res.status(400).json({ success: false, message: 'toUserId and text are required' });
  }

  const other = await User.findById(toUserId).select('_id');
  if (!other) return res.status(404).json({ success: false, message: 'User not found' });

  const msg = await Message.create({
    participants: [myId, toUserId],
    sender: myId,
    text: String(text).trim()
  });

  res.status(201).json({ success: true, item: msg });
};
