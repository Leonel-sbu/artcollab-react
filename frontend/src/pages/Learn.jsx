// src/pages/Learn.jsx - Complete Learning Platform with Monetization
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Video, Award, Clock, Users, Play, Plus, X,
    DollarSign, TrendingUp, User, Star, CheckCircle, Search,
    Filter, Layout, GraduationCap, Wallet, Send, FileText,
    Check, AlertCircle, Upload, MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
    getCourses, getCategories, getStats, getMyCourses,
    getMyEnrollments, getEarnings, getCourse, createCourse,
    enrollCourse, getMyProgress, completeLesson,
    submitAssignment, getStudentSubmissions, gradeAssignment, getMyLevel
} from "../services/courseService";

const categoryIcons = {
    art: "🎨", design: "✏️", "3d": "🎲", animation: "🎬",
    photography: "📷", music: "🎵", business: "💼", other: "🎭"
};

const difficultyColors = {
    beginner: "bg-green-500/20 text-green-400",
    intermediate: "bg-yellow-500/20 text-yellow-400",
    advanced: "bg-red-500/20 text-red-400",
    all: "bg-blue-500/20 text-blue-400"
};

const Learn = () => {
    const { user, isAuthed } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState("browse"); // browse, my-courses, enrollments, earnings, level

    // Data state
    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [earnings, setEarnings] = useState(null);
    const [myLevel, setMyLevel] = useState(null);
    const [studentSubmissions, setStudentSubmissions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, totalHours: 0 });
    const [loading, setLoading] = useState(true);

    // Filter state
    const [filters, setFilters] = useState({ search: "", category: "", difficulty: "" });

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseProgress, setCourseProgress] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [currentSubmission, setCurrentSubmission] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "", description: "", category: "art", difficulty: "all",
        pricingOneTime: 0, pricingMonthly: 0, pricingYearly: 0,
        tags: "", requirements: "", outcomes: ""
    });

    // Assignment form
    const [assignmentForm, setAssignmentForm] = useState({
        submissionText: "", submissionUrl: ""
    });

    // Grade form
    const [gradeForm, setGradeForm] = useState({
        grade: "", feedback: ""
    });

    // Load data on mount
    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadData();
    }, [activeTab, filters]);

    const loadInitialData = async () => {
        try {
            const [catRes, statsRes] = await Promise.all([getCategories(), getStats()]);
            if (catRes?.success) setCategories(catRes.categories);
            if (statsRes?.success) setStats(statsRes.stats);
        } catch (err) { console.error(err); }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "browse") {
                const params = {};
                if (filters.search) params.search = filters.search;
                if (filters.category) params.category = filters.category;
                if (filters.difficulty) params.difficulty = filters.difficulty;

                const res = await getCourses(params);
                if (res?.success) setCourses(res.items || []);
            } else if (activeTab === "my-courses") {
                const res = await getMyCourses();
                if (res?.success) setMyCourses(res.items || []);
            } else if (activeTab === "enrollments") {
                const res = await getMyEnrollments();
                if (res?.success) setMyEnrollments(res.items || []);
            } else if (activeTab === "earnings") {
                const res = await getEarnings();
                if (res?.success) setEarnings(res.earnings);
            } else if (activeTab === "level") {
                const res = await getMyLevel();
                if (res?.success) setMyLevel(res.level);
            }
        } catch (err) {
            console.error("Failed to load:", err);
        } finally {
            setLoading(false);
        }
    };

    // Shared refresh function - reloads all learning-related data
    const refreshAllLearningData = async () => {
        try {
            const [coursesRes, myCoursesRes, enrollmentsRes, earningsRes, levelRes] = await Promise.all([
                getCourses({}),
                getMyCourses(),
                getMyEnrollments(),
                getEarnings(),
                getMyLevel()
            ]);
            if (coursesRes?.success) setCourses(coursesRes.items || []);
            if (myCoursesRes?.success) setMyCourses(myCoursesRes.items || []);
            if (enrollmentsRes?.success) setMyEnrollments(enrollmentsRes.items || []);
            if (earningsRes?.success) setEarnings(earningsRes.earnings);
            if (levelRes?.success) setMyLevel(levelRes.level);
        } catch (err) {
            console.error("Failed to refresh learning data:", err);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const data = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                difficulty: formData.difficulty,
                pricing: {
                    oneTime: { enabled: true, price: Number(formData.pricingOneTime) },
                    monthly: { enabled: formData.pricingMonthly > 0, price: Number(formData.pricingMonthly) },
                    yearly: { enabled: formData.pricingYearly > 0, price: Number(formData.pricingYearly) }
                },
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
                requirements: formData.requirements.split(",").map(t => t.trim()).filter(Boolean),
                learningOutcomes: formData.outcomes.split(",").map(t => t.trim()).filter(Boolean),
                status: "published"
            };

            const res = await createCourse(data);
            if (res?.success) {
                toast.success("Course created successfully!");
                setShowCreateModal(false);
                setFormData({ title: "", description: "", category: "art", difficulty: "all", pricingOneTime: 0, pricingMonthly: 0, pricingYearly: 0, tags: "", requirements: "", outcomes: "" });
                await refreshAllLearningData();
            } else {
                toast.error(res?.message || "Failed to create");
            }
        } catch (err) {
            console.error("Create course error:", err);
            toast.error(err?.response?.data?.message || "Failed to create course");
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const res = await enrollCourse(courseId);
            if (res?.success) {
                toast.success("Enrolled successfully!");
                // Refresh all learning data
                await refreshAllLearningData();
                // Close modal and switch to enrollments tab
                setShowCourseModal(false);
                setActiveTab("enrollments");
            } else {
                toast.error(res?.message || "Failed to enroll");
            }
        } catch (err) {
            console.error("Enroll error:", err);
            toast.error(err?.response?.data?.message || "Failed to enroll");
        }
    };

    const handleViewCourse = async (course) => {
        try {
            const res = await getCourse(course._id);
            if (res?.success) {
                setSelectedCourse(res.item);

                // Handle both boolean (true) and object enrollment response
                if (res.enrollment) {
                    const progressRes = await getMyProgress(course._id);
                    if (progressRes?.success) {
                        setCourseProgress(progressRes.enrollment);
                    }
                } else {
                    setCourseProgress(null);
                }

                setShowCourseModal(true);
            }
        } catch (err) {
            console.error("Load course error:", err);
            toast.error("Failed to load course");
        }
    };

    const handleStartLesson = async (lesson, index) => {
        setCurrentLesson({ ...lesson, index });
        setShowPlayerModal(true);
    };

    const handleCompleteLesson = async () => {
        if (!currentLesson || !selectedCourse) return;
        try {
            const res = await completeLesson(selectedCourse._id, currentLesson.index);
            if (res?.success) {
                toast.success("Lesson completed! +5 points");
                setCourseProgress(res.enrollment);
            }
        } catch (err) { toast.error("Failed to complete lesson"); }
    };

    const handleSubmitAssignment = async () => {
        if (!selectedCourse || !currentLesson) return;
        try {
            const res = await submitAssignment(selectedCourse._id, {
                lessonIndex: currentLesson.index,
                title: `${currentLesson.title} Assignment`,
                submissionText: assignmentForm.submissionText,
                submissionUrl: assignmentForm.submissionUrl
            });
            if (res?.success) {
                toast.success("Assignment submitted! +10 points");
                setCourseProgress(res.enrollment);
                setShowAssignmentModal(false);
                setAssignmentForm({ submissionText: "", submissionUrl: "" });
            }
        } catch (err) { toast.error("Failed to submit assignment"); }
    };

    const handleViewSubmissions = async (courseId) => {
        try {
            const res = await getStudentSubmissions(courseId);
            if (res?.success) setStudentSubmissions(res.submissions || []);
        } catch (err) { toast.error("Failed to load submissions"); }
    };

    const handleGradeAssignment = async (enrollmentId) => {
        try {
            const res = await gradeAssignment(selectedCourse._id, enrollmentId, {
                lessonIndex: currentSubmission?.lessonIndex || 0,
                grade: parseInt(gradeForm.grade),
                feedback: gradeForm.feedback
            });
            if (res?.success) {
                toast.success("Assignment graded!");
                setGradeForm({ grade: "", feedback: "" });
                setCurrentSubmission(null);
                handleViewSubmissions(selectedCourse._id);
            }
        } catch (err) { toast.error("Failed to grade assignment"); }
    };

    // Default courses for demo
    const defaultCourses = [
        { _id: "1", title: "Digital Painting Fundamentals", description: "Master digital painting techniques", category: "art", difficulty: "beginner", pricing: { oneTime: { price: 499 } }, instructor: { name: "Sarah Chen" }, enrollmentCount: 1245, totalDurationSec: 28800 },
        { _id: "2", title: "3D Modeling for Beginners", description: "Learn 3D modeling from scratch", category: "3d", difficulty: "beginner", pricing: { oneTime: { price: 799 } }, instructor: { name: "Alex Rivera" }, enrollmentCount: 892, totalDurationSec: 43200 },
        { _id: "3", title: "AI Art Masterclass", description: "Create stunning AI artwork", category: "art", difficulty: "intermediate", pricing: { oneTime: { price: 399 }, monthly: { enabled: true, price: 99 } }, instructor: { name: "Maya Patel" }, enrollmentCount: 2103, totalDurationSec: 21600 },
        { _id: "4", title: "NFT Creation & Marketing", description: "Complete guide to NFTs", category: "business", difficulty: "all", pricing: { oneTime: { price: 599 } }, instructor: { name: "Jordan Lee" }, enrollmentCount: 1567, totalDurationSec: 36000 },
    ];

    const displayCourses = courses.length > 0 ? courses : defaultCourses;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Learn Digital Art
                    </h1>
                    <p className="text-gray-400">Professional courses from industry-leading artists</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: BookOpen, label: "Courses", value: stats.totalCourses || "50+" },
                        { icon: Users, label: "Students", value: stats.totalStudents || "10K+" },
                        { icon: Video, label: "Hours", value: stats.totalHours || "200+" },
                        { icon: Award, label: "Instructors", value: "25+" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-gray-800/50 p-4 rounded-xl text-center">
                            <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-gray-400 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-800/50 rounded-xl p-1 flex gap-1 flex-wrap justify-center">
                        {[
                            { id: "browse", label: "Browse Courses", icon: Search },
                            { id: "my-courses", label: "My Courses", icon: BookOpen },
                            { id: "enrollments", label: "My Learning", icon: GraduationCap },
                            { id: "earnings", label: "Earnings", icon: DollarSign },
                            { id: "level", label: "My Level", icon: Award }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm ${activeTab === tab.id
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Browse Filters */}
                {activeTab === "browse" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/30 rounded-xl p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                                <option value="">All Levels</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="all">All Levels</option>
                            </select>
                            {isAuthed && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Create Course
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Earnings Dashboard */}
                {activeTab === "earnings" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                        {earnings ? (
                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-6 rounded-2xl border border-green-500/30">
                                    <DollarSign className="w-10 h-10 text-green-400 mb-3" />
                                    <div className="text-3xl font-bold text-green-400">R {earnings.totalEarnings?.toLocaleString() || 0}</div>
                                    <div className="text-gray-400">Total Earnings</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-2xl border border-blue-500/30">
                                    <Users className="w-10 h-10 text-blue-400 mb-3" />
                                    <div className="text-3xl font-bold text-blue-400">{earnings.totalStudents || 0}</div>
                                    <div className="text-gray-400">Total Students</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-6 rounded-2xl border border-purple-500/30">
                                    <BookOpen className="w-10 h-10 text-purple-400 mb-3" />
                                    <div className="text-3xl font-bold text-purple-400">{earnings.totalCourses || 0}</div>
                                    <div className="text-gray-400">Published Courses</div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800/30 p-8 rounded-xl text-center">
                                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
                                <p className="text-gray-400 mb-4">Create courses and earn money from students</p>
                                <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                    Create Your First Course
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Level Dashboard */}
                {activeTab === "level" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                        {myLevel ? (
                            <div className="space-y-6">
                                {/* Level Card */}
                                <div className="bg-gradient-to-br from-yellow-900/50 to-orange-800/30 p-8 rounded-2xl border border-yellow-500/30 text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{myLevel.level}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">Level {myLevel.level}</h2>
                                    <p className="text-gray-400 mb-4">{myLevel.pointsToNextLevel} points to Level {myLevel.level + 1}</p>

                                    {/* Progress Bar */}
                                    <div className="max-w-md mx-auto">
                                        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                                                style={{ width: `${myLevel.levelProgress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                                            <span>{myLevel.totalPoints} pts</span>
                                            <span>100 pts</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                                        <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                                        <div className="text-2xl font-bold">{myLevel.totalPoints}</div>
                                        <div className="text-gray-400 text-sm">Total Points</div>
                                    </div>
                                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                                        <div className="text-2xl font-bold">{myLevel.totalStreak}</div>
                                        <div className="text-gray-400 text-sm">Day Streak</div>
                                    </div>
                                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                                        <div className="text-2xl font-bold">{myLevel.completedCourses}</div>
                                        <div className="text-gray-400 text-sm">Completed</div>
                                    </div>
                                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                                        <Clock className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                                        <div className="text-2xl font-bold">{myLevel.avgProgress}%</div>
                                        <div className="text-gray-400 text-sm">Avg Progress</div>
                                    </div>
                                </div>

                                {/* How to Earn Points */}
                                <div className="bg-gray-800/30 p-6 rounded-xl">
                                    <h3 className="font-bold mb-4">How to Earn Points</h3>
                                    <div className="space-y-3 text-sm text-gray-400">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span>Complete a lesson: <span className="text-white">+5 points</span></span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Send className="w-4 h-4 text-blue-400" />
                                            <span>Submit an assignment: <span className="text-white">+10 points</span></span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            <span>Get a good grade: <span className="text-white">+1-10 points</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800/30 p-8 rounded-xl text-center">
                                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
                                <p className="text-gray-400 mb-4">Enroll in courses to earn points and level up!</p>
                                <button onClick={() => setActiveTab('browse')} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                                    Browse Courses
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(activeTab === "browse" ? displayCourses : activeTab === "my-courses" ? myCourses : activeTab === "enrollments" ? myEnrollments.filter(e => e).map(e => e.course || e) : []).map((course, index) => (
                            <motion.div
                                key={course._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gray-800/50 rounded-2xl overflow-hidden hover:border-blue-500/50 border border-transparent transition group"
                            >
                                <div className="h-40 bg-gradient-to-r from-blue-900/30 to-purple-900/30 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play className="w-12 h-12 text-white/30 group-hover:text-white/50 transition" />
                                    </div>
                                    {course.isFeatured && (
                                        <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Featured</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{categoryIcons[course.category] || "🎨"}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[course.difficulty] || difficultyColors.all}`}>
                                            {course.difficulty || "all"}
                                        </span>
                                    </div>
                                    <h3 className="font-bold mb-1 line-clamp-2">{course.title}</h3>
                                    <p className="text-gray-400 text-sm mb-3">by {course.instructor?.name || "Instructor"}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.round((course.totalDurationSec || 3600) / 3600)}h</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrollmentCount || 0}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-bold text-blue-400">
                                            {course.pricing?.oneTime?.price > 0
                                                ? `R ${course.pricing.oneTime.price}`
                                                : "Free"}
                                        </div>
                                        <button
                                            onClick={() => handleViewCourse(course)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
                                        >
                                            {activeTab === "enrollments" ? "Continue" : "View"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && (activeTab === "browse" ? displayCourses : activeTab === "my-courses" ? myCourses : activeTab === "enrollments" ? myEnrollments.filter(e => e) : []).length === 0 && (
                    <div className="text-center py-16">
                        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                        <p className="text-gray-400">
                            {activeTab === "browse" ? "Try adjusting your filters" :
                                activeTab === "my-courses" ? "Create your first course to start teaching" :
                                    "Enroll in courses to start learning"}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Course Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full my-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Create New Course</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={handleCreateCourse} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Course Title *</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Category</label>
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                                        <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                                            <option value="all">All Levels</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">One-time Price (ZAR)</label>
                                        <input type="number" value={formData.pricingOneTime} onChange={(e) => setFormData({ ...formData, pricingOneTime: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Monthly (ZAR)</label>
                                        <input type="number" value={formData.pricingMonthly} onChange={(e) => setFormData({ ...formData, pricingMonthly: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">Yearly (ZAR)</label>
                                        <input type="number" value={formData.pricingYearly} onChange={(e) => setFormData({ ...formData, pricingYearly: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Tags (comma separated)</label>
                                    <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="digital, art, painting" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold">
                                    Create Course
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Course View Modal */}
            <AnimatePresence>
                {showCourseModal && selectedCourse && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-4xl">{categoryIcons[selectedCourse.category] || "🎨"}</span>
                                    <h2 className="text-2xl font-bold mt-2">{selectedCourse.title}</h2>
                                </div>
                                <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>

                            <p className="text-gray-300 mb-4">{selectedCourse.description}</p>

                            <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedCourse.instructor?.name}</span>
                                <span className={`px-2 py-0.5 rounded ${difficultyColors[selectedCourse.difficulty]}`}>{selectedCourse.difficulty}</span>
                            </div>

                            {/* Pricing Options */}
                            <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                                <h4 className="font-semibold mb-3">Pricing Options</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {selectedCourse.pricing?.oneTime?.enabled && (
                                        <div className="bg-gray-800 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-blue-400">R {selectedCourse.pricing.oneTime.price}</div>
                                            <div className="text-xs text-gray-400">One-time</div>
                                        </div>
                                    )}
                                    {selectedCourse.pricing?.monthly?.enabled && (
                                        <div className="bg-gray-800 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-purple-400">R {selectedCourse.pricing.monthly.price}</div>
                                            <div className="text-xs text-gray-400">/month</div>
                                        </div>
                                    )}
                                    {selectedCourse.pricing?.yearly?.enabled && (
                                        <div className="bg-gray-800 p-3 rounded-lg text-center">
                                            <div className="text-lg font-bold text-green-400">R {selectedCourse.pricing.yearly.price}</div>
                                            <div className="text-xs text-gray-400">/year</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress (if enrolled) */}
                            {courseProgress && (
                                <div className="bg-blue-900/30 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold">Your Progress</span>
                                        <span className="text-blue-400">{courseProgress.progressPercent || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${courseProgress.progressPercent || 0}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Lessons List (if enrolled) */}
                            {courseProgress && selectedCourse?.lessons?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-3">Course Lessons</h4>
                                    <div className="space-y-2">
                                        {selectedCourse.lessons.map((lesson, idx) => {
                                            const isCompleted = courseProgress.completedLessons?.includes(idx);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleStartLesson(lesson, idx)}
                                                    className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition ${isCompleted ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-800 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600'
                                                        }`}>
                                                        {isCompleted ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{lesson.title}</div>
                                                        <div className="text-xs text-gray-400">
                                                            {Math.round((lesson.durationSec || 0) / 60)} min
                                                        </div>
                                                    </div>
                                                    <Play className="w-4 h-4 text-gray-500" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!courseProgress && isAuthed && (
                                <button
                                    onClick={() => handleEnroll(selectedCourse._id)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
                                >
                                    Enroll Now
                                </button>
                            )}

                            {courseProgress && (
                                <button
                                    onClick={() => {
                                        const lessons = selectedCourse?.lessons || [];
                                        const completed = courseProgress.completedLessons || [];
                                        const nextLesson = lessons.find((l, i) => !completed.includes(i));
                                        if (nextLesson) {
                                            const idx = lessons.indexOf(nextLesson);
                                            handleStartLesson(nextLesson, idx);
                                        } else if (lessons.length > 0) {
                                            handleStartLesson(lessons[0], 0);
                                        }
                                    }}
                                    className="w-full py-3 bg-green-600 rounded-lg font-semibold"
                                >
                                    Continue Learning
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Player Modal */}
            <AnimatePresence>
                {showPlayerModal && currentLesson && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPlayerModal(false)}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{currentLesson.title}</h3>
                                    <p className="text-gray-400 text-sm">Lesson {currentLesson.index + 1}</p>
                                </div>
                                <button onClick={() => setShowPlayerModal(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Video Player Area */}
                            <div className="aspect-video bg-black flex items-center justify-center">
                                {currentLesson.videoUrl ? (
                                    <video controls className="w-full h-full" src={currentLesson.videoUrl} />
                                ) : (
                                    <div className="text-center">
                                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">No video available</p>
                                        <p className="text-gray-500 text-sm">Instructor hasn't uploaded video yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-gray-800 flex gap-3">
                                <button
                                    onClick={handleCompleteLesson}
                                    className="flex-1 py-3 bg-green-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Mark Complete (+5 pts)
                                </button>
                                <button
                                    onClick={() => setShowAssignmentModal(true)}
                                    className="flex-1 py-3 bg-blue-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Submit Assignment
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assignment Submission Modal */}
            <AnimatePresence>
                {showAssignmentModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAssignmentModal(false)}
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900">
                                <h3 className="font-bold text-lg">Submit Assignment</h3>
                                <button onClick={() => setShowAssignmentModal(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Assignment Title</label>
                                    <input
                                        type="text"
                                        value={currentLesson?.title + " Assignment" || ""}
                                        disabled
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Your Work (URL)</label>
                                    <input
                                        type="url"
                                        placeholder="Link to your work (e.g., Google Drive, Dropbox, portfolio)"
                                        value={assignmentForm.submissionUrl}
                                        onChange={e => setAssignmentForm({ ...assignmentForm, submissionUrl: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe what you created..."
                                        value={assignmentForm.submissionText}
                                        onChange={e => setAssignmentForm({ ...assignmentForm, submissionText: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitAssignment}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    Submit Assignment (+10 pts)
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Learn;
