const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

/* ----------------------------- LIST COURSES ----------------------------- */
exports.list = async (req, res) => {
  try {
    const { category, difficulty, search, featured, page = 1, limit = 20 } = req.query;

    const query = { status: 'published' };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const items = await Course.find(query)
      .populate('instructor', 'name')
      .sort({ isFeatured: -1, enrollmentCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error("List courses error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET CATEGORIES ----------------------------- */
exports.getCategories = async (req, res) => {
  const categories = [
    { id: 'art', name: 'Art & Drawing', icon: '🎨' },
    { id: 'design', name: 'Graphic Design', icon: '✏️' },
    { id: '3d', name: '3D Modeling', icon: '🎲' },
    { id: 'animation', name: 'Animation', icon: '🎬' },
    { id: 'photography', name: 'Photography', icon: '📷' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'other', name: 'Other', icon: '🎭' }
  ];

  res.json({ success: true, categories });
};

/* ----------------------------- GET MY COURSES (Instructor) ----------------------------- */
exports.myCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, items: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET MY ENROLLMENTS ----------------------------- */
exports.myEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ enrolledAt: -1 });

    res.json({ success: true, items: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET INSTRUCTOR EARNINGS ----------------------------- */
exports.getEarnings = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });

    const totalEarnings = courses.reduce((sum, c) => sum + (c.revenue?.totalEarnings || 0), 0);
    const totalStudents = courses.reduce((sum, c) => sum + (c.revenue?.totalStudents || 0), 0);
    const totalCourses = courses.length;

    res.json({
      success: true,
      earnings: {
        totalEarnings,
        totalStudents,
        totalCourses,
        courses: courses.map(c => ({
          _id: c._id,
          title: c.title,
          earnings: c.revenue?.totalEarnings || 0,
          students: c.revenue?.totalStudents || 0,
          enrollmentCount: c.enrollmentCount || 0
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET BY ID ----------------------------- */
exports.getById = async (req, res) => {
  try {
    const item = await Course.findById(req.params.id)
      .populate('instructor', 'name');

    if (!item) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check if user is enrolled
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({ user: req.user.id, course: item._id });
    }

    res.json({ success: true, item, enrollment: enrollment ? true : false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- CREATE COURSE ----------------------------- */
exports.create = async (req, res) => {
  try {
    const {
      title, description, shortDescription, thumbnailUrl, category, difficulty, tags,
      pricing, learningOutcomes, requirements, status, lessons
    } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const course = await Course.create({
      title,
      description: description || '',
      shortDescription: shortDescription || '',
      thumbnailUrl: thumbnailUrl || '',
      category: category || 'art',
      difficulty: difficulty || 'all',
      tags: tags || [],
      pricing: pricing || {
        oneTime: { enabled: true, price: 0 },
        monthly: { enabled: false, price: 0 },
        yearly: { enabled: false, price: 0 },
        subscription: { enabled: false }
      },
      learningOutcomes: learningOutcomes || [],
      requirements: requirements || [],
      lessons: lessons || [],
      status: status || 'draft',
      instructor: req.user.id
    });

    await course.populate('instructor', 'name');

    res.status(201).json({ success: true, item: course });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- UPDATE COURSE ----------------------------- */
exports.update = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check ownership
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'title', 'description', 'shortDescription', 'thumbnailUrl', 'category',
      'difficulty', 'tags', 'pricing', 'learningOutcomes', 'requirements',
      'lessons', 'status', 'isFeatured'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        course[field] = updates[field];
      }
    });

    await course.save();
    await course.populate('instructor', 'name');

    res.json({ success: true, item: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- DELETE COURSE ----------------------------- */
exports.remove = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- ENROLL IN COURSE ----------------------------- */
exports.enroll = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { paymentType } = req.body; // 'oneTime', 'monthly', 'yearly'

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });

    if (enrollment) {
      return res.json({ success: true, message: 'Already enrolled', enrollment });
    }

    // Create enrollment
    enrollment = await Enrollment.create({
      user: req.user.id,
      course: courseId,
      paymentType: paymentType || 'oneTime',
      paymentStatus: course.pricing?.oneTime?.price > 0 ? 'paid' : 'free',
      status: 'active'
    });

    // Update course stats
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    course.revenue = course.revenue || {};
    course.revenue.totalStudents = (course.revenue.totalStudents || 0) + 1;

    // Add earnings (in real app, this would be from payment processing)
    if (course.pricing?.oneTime?.price > 0) {
      course.revenue.oneTimeEarnings = (course.revenue.oneTimeEarnings || 0) + course.pricing.oneTime.price;
      course.revenue.totalEarnings = (course.revenue.totalEarnings || 0) + course.pricing.oneTime.price;
    }

    await course.save();

    await enrollment.populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name' }
    });

    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    console.error("Enroll error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET MY PROGRESS ----------------------------- */
exports.getMyProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled' });
    }

    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- COMPLETE LESSON ----------------------------- */
exports.completeLesson = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { lessonId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const enrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });

    // Add lesson to completed
    if (!enrollment.completedLessons) enrollment.completedLessons = [];

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Calculate progress
    const totalLessons = course.lessons?.length || 0;
    enrollment.progressPercent = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    // Check if course is completed
    if (enrollment.progressPercent === 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }

    // Award points for completing lesson
    await enrollment.addPoints(5);

    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET COURSE STATS ----------------------------- */
exports.getStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments({ status: 'published' });
    const totalEnrollments = await Enrollment.countDocuments();

    // Aggregate student counts
    const courses = await Course.find({ status: 'published' });
    const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

    // Total hours (estimate)
    const totalSeconds = courses.reduce((sum, c) => sum + (c.totalDurationSec || 0), 0);
    const totalHours = Math.round(totalSeconds / 3600);

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalEnrollments,
        totalStudents,
        totalHours
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- SUBMIT ASSIGNMENT ----------------------------- */
exports.submitAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonIndex, title, description, submissionUrl, submissionText } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Find or create assignment
    let assignment = enrollment.assignments?.find(a => a.lessonIndex === lessonIndex);

    if (assignment) {
      // Update existing assignment
      assignment.submissionUrl = submissionUrl || assignment.submissionUrl;
      assignment.submissionText = submissionText || assignment.submissionText;
      assignment.submittedAt = new Date();
      assignment.status = 'submitted';
    } else {
      // Create new assignment
      const newAssignment = {
        lessonIndex,
        title: title || `Lesson ${lessonIndex + 1} Assignment`,
        description: description || '',
        submissionUrl: submissionUrl || '',
        submissionText: submissionText || '',
        submittedAt: new Date(),
        status: 'submitted'
      };

      if (!enrollment.assignments) enrollment.assignments = [];
      enrollment.assignments.push(newAssignment);
    }

    // Award points for submission
    await enrollment.addPoints(10);

    await enrollment.save();

    res.json({ success: true, message: 'Assignment submitted successfully', enrollment });
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GRADE ASSIGNMENT (Instructor) ----------------------------- */
exports.gradeAssignment = async (req, res) => {
  try {
    const { courseId, enrollmentId } = req.params;
    const { lessonIndex, grade, feedback } = req.body;

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the instructor can grade assignments' });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Find and update assignment
    const assignment = enrollment.assignments?.find(a => a.lessonIndex === lessonIndex);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    assignment.grade = grade;
    assignment.feedback = feedback || '';
    assignment.gradedAt = new Date();
    assignment.gradedBy = req.user.id;
    assignment.status = grade >= 60 ? 'graded' : 'revision';

    // Award points based on grade
    const pointsEarned = Math.round(grade / 10); // 10 points per grade point
    await enrollment.addPoints(pointsEarned);

    await enrollment.save();

    res.json({ success: true, message: 'Assignment graded successfully', enrollment });
  } catch (err) {
    console.error('Grade assignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET STUDENT SUBMISSIONS (Instructor) ----------------------------- */
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the instructor can view submissions' });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Filter to only show enrollments with assignments
    const submissions = enrollments
      .filter(e => e.assignments && e.assignments.length > 0)
      .map(e => ({
        _id: e._id,
        student: e.user,
        progressPercent: e.progressPercent,
        currentLevel: e.currentLevel,
        totalPoints: e.totalPoints,
        assignments: e.assignments,
        enrolledAt: e.createdAt
      }));

    res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ----------------------------- GET MY LEVEL/PROGRESS ----------------------------- */
exports.getMyLevel = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id });

    // Calculate overall stats
    const totalPoints = enrollments.reduce((sum, e) => sum + (e.totalPoints || 0), 0);
    const totalStreak = enrollments.reduce((sum, e) => sum + (e.streakDays || 0), 0);
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0) / enrollments.length)
      : 0;
    const overallLevel = Math.min(10, Math.floor(totalPoints / 100) + 1);

    // Get level progress
    const pointsInCurrentLevel = totalPoints % 100;
    const levelProgress = Math.round((pointsInCurrentLevel / 100) * 100);

    res.json({
      success: true,
      level: {
        level: overallLevel,
        totalPoints,
        totalStreak,
        avgProgress,
        pointsToNextLevel: 100 - pointsInCurrentLevel,
        levelProgress,
        completedCourses: enrollments.filter(e => e.isCompleted).length,
        inProgressCourses: enrollments.filter(e => e.progressPercent > 0 && !e.isCompleted).length
      }
    });
  } catch (err) {
    console.error('Get level error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
