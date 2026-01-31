const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.list = async (req, res) => {
  const items = await Course.find({ status: 'published' })
    .populate('instructor', 'name role')
    .sort({ createdAt: -1 });

  res.json({ success: true, items });
};

exports.getById = async (req, res) => {
  const item = await Course.findById(req.params.id).populate('instructor', 'name role');
  if (!item) return res.status(404).json({ success: false, message: 'Course not found' });
  res.json({ success: true, item });
};

// creator: artist/admin
exports.create = async (req, res) => {
  const { title, description, thumbnailUrl, price, lessons, status } = req.body || {};
  if (!title) return res.status(400).json({ success: false, message: 'title is required' });

  const item = await Course.create({
    title: String(title).trim(),
    description: description || '',
    thumbnailUrl: thumbnailUrl || '',
    price: typeof price === 'number' ? price : Number(price || 0),
    lessons: Array.isArray(lessons) ? lessons : [],
    status: status || 'published',
    instructor: req.user.id
  });

  res.status(201).json({ success: true, item });
};

exports.enroll = async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const enrollment = await Enrollment.findOneAndUpdate(
    { user: req.user.id, course: courseId },
    { $setOnInsert: { user: req.user.id, course: courseId } },
    { upsert: true, new: true }
  );

  res.json({ success: true, enrollment });
};

exports.getMyProgress = async (req, res) => {
  const courseId = req.params.id;
  const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
  if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });

  res.json({ success: true, enrollment });
};

exports.completeLesson = async (req, res) => {
  const courseId = req.params.id;
  const { lessonIndex } = req.body || {};

  if (lessonIndex === undefined || lessonIndex === null) {
    return res.status(400).json({ success: false, message: 'lessonIndex is required' });
  }

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const idx = Number(lessonIndex);
  if (!Number.isFinite(idx) || idx < 0) {
    return res.status(400).json({ success: false, message: 'lessonIndex must be a valid number' });
  }

  const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
  if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });

  const set = new Set(enrollment.completedLessons || []);
  set.add(idx);
  enrollment.completedLessons = Array.from(set).sort((a, b) => a - b);

  const total = Array.isArray(course.lessons) ? course.lessons.length : 0;
  enrollment.progressPercent = total > 0
    ? Math.round((enrollment.completedLessons.length / total) * 100)
    : 0;

  await enrollment.save();

  res.json({ success: true, enrollment });
};
