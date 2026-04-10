// src/pages/Learn.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Users, Play, Clock, Award, Plus, X, Search, Home,
    BookMarked, Sparkles, Star, ChevronRight, CheckCircle2,
    Zap, Target, Globe, ChevronLeft, Lock, PlayCircle,
    Filter, RefreshCw, AlertCircle, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
    getCourses, getMyEnrollments, getMyLevel,
    enrollCourse, getCourse, getMyProgress, completeLesson
} from "../services/courseService";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEmbedUrl(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const categoryConfig = {
    art: { name: "Digital Art", icon: "🎨", color: "from-pink-500 to-rose-500" },
    design: { name: "Design", icon: "✏️", color: "from-purple-500 to-indigo-500" },
    "3d": { name: "3D Modeling", icon: "🎲", color: "from-blue-500 to-cyan-500" },
    animation: { name: "Animation", icon: "🎬", color: "from-orange-500 to-red-500" },
    photography: { name: "Photography", icon: "📷", color: "from-green-500 to-emerald-500" },
    music: { name: "Music", icon: "🎵", color: "from-violet-500 to-purple-500" },
    business: { name: "Business", icon: "💼", color: "from-yellow-500 to-amber-500" },
    other: { name: "Other", icon: "🎭", color: "from-gray-500 to-slate-500" },
};

const difficultyColors = {
    beginner: "bg-green-500/20 text-green-400 border border-green-500/30",
    intermediate: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    advanced: "bg-red-500/20 text-red-400 border border-red-500/30",
    all: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

const difficultyLabel = {
    beginner: "🌱 Beginner",
    intermediate: "⚡ Intermediate",
    advanced: "🔥 Advanced",
    all: "📚 All Levels",
};

// ─── Course Player Modal ──────────────────────────────────────────────────────

function CoursePlayerModal({ course, onClose }) {
    const [progress, setProgress] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(0);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getMyProgress(course._id);
                if (res?.success) setProgress(res.progress);
            } catch { /* non-blocking */ }
        };
        load();
    }, [course._id]);

    const lessons = course.lessons || [];
    const completedSet = new Set(progress?.completedLessons?.map(String) || []);
    const lesson = lessons[currentLesson];
    const isCompleted = completedSet.has(String(currentLesson));
    const progressPct = lessons.length > 0 ? Math.round((completedSet.size / lessons.length) * 100) : 0;

    const handleCompleteLesson = async (index) => {
        if (completing) return;
        setCompleting(true);
        try {
            const res = await completeLesson(course._id, index);
            if (res?.success) {
                toast.success(`+${res.xpEarned || 10} XP earned! 🎉`);
                setProgress(res.progress);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to mark lesson complete");
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg truncate">{course.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="h-1.5 bg-gray-700 rounded-full flex-1 max-w-xs">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{progressPct}% complete</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="ml-4 p-2 rounded-lg hover:bg-gray-800 transition flex-shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Lesson sidebar */}
                    <div className="w-64 border-r border-gray-800 overflow-y-auto flex-shrink-0 hidden md:block">
                        <div className="p-3">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                                Lessons ({lessons.length})
                            </p>
                            {lessons.length === 0 && (
                                <p className="text-xs text-gray-500 italic">No lessons added yet.</p>
                            )}
                            {lessons.map((l, i) => {
                                const done = completedSet.has(String(i));
                                return (
                                    <button key={i} onClick={() => setCurrentLesson(i)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex items-start gap-2.5 transition text-sm ${
                                            currentLesson === i
                                                ? "bg-blue-600/30 border border-blue-500/40 text-white"
                                                : "hover:bg-gray-800 text-gray-300"
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${done ? "bg-green-500" : "bg-gray-700"}`}>
                                            {done
                                                ? <CheckCircle2 className="w-3 h-3 text-white" />
                                                : <span className="text-xs text-gray-400">{i + 1}</span>}
                                        </div>
                                        <span className="flex-1 line-clamp-2 leading-snug">{l.title || `Lesson ${i + 1}`}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {lessons.length === 0 ? (
                            <div className="text-center py-16">
                                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                                <p className="text-gray-500">The instructor hasn't added lessons yet. Check back soon!</p>
                            </div>
                        ) : lesson ? (
                            <>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                    <span>Lesson {currentLesson + 1} of {lessons.length}</span>
                                    {isCompleted && (
                                        <span className="flex items-center gap-1 text-green-400">
                                            <CheckCircle2 className="w-3 h-3" /> Completed
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold mb-4">{lesson.title || `Lesson ${currentLesson + 1}`}</h3>

                                {lesson.videoUrl ? (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                                        {getEmbedUrl(lesson.videoUrl) ? (
                                            <iframe
                                                key={lesson.videoUrl}
                                                src={getEmbedUrl(lesson.videoUrl)}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title={lesson.title || 'Lesson video'}
                                            />
                                        ) : (
                                            <video src={lesson.videoUrl} controls className="w-full h-full" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-6 border border-gray-700">
                                        <div className="text-center">
                                            <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No video for this lesson</p>
                                        </div>
                                    </div>
                                )}

                                {lesson.content && (
                                    <div className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{lesson.content}</div>
                                )}

                                {lesson.resources?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold mb-2 text-gray-400">Resources</h4>
                                        <ul className="space-y-1">
                                            {lesson.resources.map((r, i) => (
                                                <li key={i}>
                                                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline text-sm">{r.title || r.url}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-800">
                                    <button
                                        onClick={() => setCurrentLesson(i => Math.max(0, i - 1))}
                                        disabled={currentLesson === 0}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40 flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Previous
                                    </button>

                                    <button
                                        onClick={() => !isCompleted && handleCompleteLesson(currentLesson)}
                                        disabled={isCompleted || completing}
                                        className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                                            isCompleted
                                                ? "bg-green-800/40 text-green-400 cursor-default"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                        }`}
                                    >
                                        {completing
                                            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                                            : isCompleted
                                                ? <><CheckCircle2 className="w-4 h-4" /> Completed</>
                                                : <><CheckCircle2 className="w-4 h-4" /> Mark Complete</>}
                                    </button>

                                    <button
                                        onClick={() => setCurrentLesson(i => Math.min(lessons.length - 1, i + 1))}
                                        disabled={currentLesson === lessons.length - 1}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40 flex items-center gap-1"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Course Payment Modal ─────────────────────────────────────────────────────

function CoursePaymentModal({ course, onSuccess, onClose }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const price = course.pricing?.oneTime?.price;

    const handlePay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setProcessing(true);
        setError('');
        try {
            // 1. Create payment intent on backend
            const res = await api.post(`/api/courses/${course._id}/checkout`);
            if (!res.data?.success) throw new Error(res.data?.message || 'Checkout failed');
            const { clientSecret } = res.data;

            // 2. Confirm card payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) }
            });

            if (stripeError) throw new Error(stripeError.message);
            if (paymentIntent.status !== 'succeeded') throw new Error('Payment not completed');

            // 3. Enroll with proof of payment
            const enrollRes = await api.post(`/api/courses/${course._id}/enroll`, {
                paymentIntentId: paymentIntent.id
            });
            if (!enrollRes.data?.success) throw new Error(enrollRes.data?.message || 'Enrollment failed');

            onSuccess();
        } catch (err) {
            setError(err.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-bold">Complete Purchase</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-gray-700/40 rounded-xl p-4 mb-5">
                    <p className="text-sm text-gray-400 mb-1">{course.title}</p>
                    <p className="text-2xl font-bold text-blue-400">R {price?.toLocaleString()}</p>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Card Details</label>
                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                            <CardElement options={{
                                style: {
                                    base: { color: '#fff', fontSize: '16px', '::placeholder': { color: '#9ca3af' } },
                                    invalid: { color: '#f87171' }
                                }
                            }} />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={processing || !stripe}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
                        {processing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</> : `Pay R ${price?.toLocaleString()}`}
                    </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-3">Secured by Stripe</p>
            </motion.div>
        </div>
    );
}

// ─── Course Detail Modal ──────────────────────────────────────────────────────

function CourseDetailModal({ course, enrolled, onEnroll, onClose }) {
    const [enrolling, setEnrolling] = useState(false);

    const handleEnroll = async () => {
        setEnrolling(true);
        await onEnroll(course._id);
        setEnrolling(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className={`h-40 bg-gradient-to-br ${categoryConfig[course.category]?.color || "from-gray-600 to-gray-700"} relative flex items-center justify-center rounded-t-2xl`}>
                    <span className="text-6xl">{categoryConfig[course.category]?.icon || "🎨"}</span>
                    <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 p-1.5 rounded-lg hover:bg-black/60 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-2 mb-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${difficultyColors[course.difficulty] || difficultyColors.all}`}>
                            {difficultyLabel[course.difficulty] || "📚 All Levels"}
                        </span>
                        <span className="px-2.5 py-1 rounded text-xs bg-gray-700 text-gray-300">
                            {categoryConfig[course.category]?.name || course.category}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold mb-1">{course.title}</h2>
                    <p className="text-sm text-gray-400 mb-4">by {course.instructor?.name || "Instructor"}</p>

                    {course.description && (
                        <p className="text-gray-300 text-sm leading-relaxed mb-5">{course.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                            <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <div className="text-sm font-semibold">{Math.round((course.totalDurationSec || 0) / 3600)}h</div>
                            <div className="text-xs text-gray-500">Duration</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <div className="text-sm font-semibold">{course.enrollmentCount || 0}</div>
                            <div className="text-xs text-gray-500">Students</div>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                            <BookOpen className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                            <div className="text-sm font-semibold">{course.lessons?.length || 0}</div>
                            <div className="text-xs text-gray-500">Lessons</div>
                        </div>
                    </div>

                    {course.lessons?.length > 0 && (
                        <div className="mb-5">
                            <h3 className="text-sm font-semibold text-gray-400 mb-2">Course Curriculum</h3>
                            <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {course.lessons.map((l, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                        {enrolled
                                            ? <PlayCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            : <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                                        <span className="line-clamp-1">{l.title || `Lesson ${i + 1}`}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-400">
                            {course.pricing?.oneTime?.price > 0 ? `R ${course.pricing.oneTime.price}` : "Free"}
                        </div>
                        {!enrolled ? (
                            <button onClick={handleEnroll} disabled={enrolling}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition disabled:opacity-60 flex items-center gap-2">
                                {enrolling ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enrolling...</> : "Enroll Now"}
                            </button>
                        ) : (
                            <span className="flex items-center gap-2 text-green-400 font-medium">
                                <CheckCircle2 className="w-5 h-5" /> Enrolled
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Learn = () => {
    const { isAuthed } = useAuth() || {};

    const [courses, setCourses] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [myLevel, setMyLevel] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [activeFilter, setActiveFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    // Modals
    const [playerCourse, setPlayerCourse] = useState(null);
    const [detailCourse, setDetailCourse] = useState(null);
    const [paymentCourse, setPaymentCourse] = useState(null);

    const enrolledIds = new Set(enrolled.map(e => e.course?._id || e.course || e._id));

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page };
            if (search) params.search = search;
            if (categoryFilter) params.category = categoryFilter;
            if (difficultyFilter) params.difficulty = difficultyFilter;

            const [coursesRes, enrollRes, levelRes] = await Promise.all([
                getCourses(params),
                isAuthed ? getMyEnrollments() : Promise.resolve(null),
                isAuthed ? getMyLevel() : Promise.resolve(null),
            ]);
            if (coursesRes?.success) {
                setCourses(coursesRes.items || []);
                setPagination(coursesRes.pagination || null);
            }
            if (enrollRes?.success) setEnrolled(enrollRes.items || []);
            if (levelRes?.success) setMyLevel(levelRes.level);
        } catch (err) {
            if (err?.code === "ERR_NETWORK") toast.error("Unable to connect to server");
        } finally {
            setLoading(false);
        }
    }, [page, search, categoryFilter, difficultyFilter, isAuthed]);

    useEffect(() => { loadData(); }, [loadData]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Build display list based on active filter
    const displayCourses = (() => {
        if (activeFilter === "enrolled") {
            return enrolled.map(e => {
                const c = e.course && typeof e.course === "object" ? e.course : { _id: e.course };
                return { ...c, enrolled: true, progress: e.progress || 0 };
            });
        }
        if (activeFilter === "available") {
            return courses.filter(c => !enrolledIds.has(c._id));
        }
        return courses.map(c => ({ ...c, enrolled: enrolledIds.has(c._id) }));
    })();

    const enrolledCount = enrolled.length;
    const completedCount = enrolled.filter(e => e.progress === 100).length;
    const avgProgress = enrolled.length > 0
        ? Math.round(enrolled.reduce((s, e) => s + (e.progress || 0), 0) / enrolled.length)
        : 0;

    const hasFilters = categoryFilter || difficultyFilter || search;

    const clearFilters = () => {
        setCategoryFilter(""); setDifficultyFilter(""); setSearchInput(""); setSearch(""); setPage(1);
    };

    const handleEnroll = async (courseId) => {
        if (!isAuthed) { toast.error("Please log in to enroll in courses"); return; }
        const course = courses.find(c => c._id === courseId) || detailCourse;
        const price = course?.pricing?.oneTime?.price;
        if (price && price > 0) {
            // Show payment modal for paid courses
            setDetailCourse(null);
            setPaymentCourse(course);
            return;
        }
        // Free course — enroll directly
        try {
            const res = await enrollCourse(courseId);
            if (res?.success) {
                toast.success("Enrolled! 🎉");
                await loadData();
                setDetailCourse(null);
                setActiveFilter("enrolled");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Enrollment failed");
        }
    };

    const openPlayer = async (course) => {
        try {
            const res = await getCourse(course._id);
            setPlayerCourse(res?.item || res?.course || course);
        } catch {
            setPlayerCourse(course);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-300">Learning Hub</span>
                </div>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                        Learning Hub
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Discover expert-led courses, track your progress, and level up your creative skills.
                    </p>
                </motion.div>

                {/* Level Card */}
                {isAuthed && myLevel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mb-5 bg-gradient-to-br from-yellow-900/30 to-orange-800/20 p-4 rounded-2xl border border-yellow-500/20">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <span className="text-xl font-bold text-white">{myLevel.level}</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-yellow-400">Level {myLevel.level}</div>
                                    <div className="text-xs text-gray-400">{myLevel.pointsToNextLevel} XP to next level</div>
                                    <div className="w-28 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${myLevel.levelProgress}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-1.5 text-green-400"><Zap className="w-4 h-4" />{myLevel.totalStreak}d streak</span>
                                <span className="flex items-center gap-1.5 text-blue-400"><CheckCircle2 className="w-4 h-4" />{myLevel.completedCourses} completed</span>
                                <span className="flex items-center gap-1.5 text-purple-400"><Target className="w-4 h-4" />{myLevel.totalPoints} XP</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                        { icon: BookOpen, color: "text-blue-400", value: pagination?.total ?? courses.length, label: "Total Courses" },
                        { icon: BookMarked, color: "text-green-400", value: enrolledCount, label: "Enrolled" },
                        { icon: Award, color: "text-yellow-400", value: completedCount, label: "Completed" },
                        { icon: Target, color: "text-purple-400", value: `${avgProgress}%`, label: "Avg Progress" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                            <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                            <div className="text-xl font-bold">{stat.value}</div>
                            <div className="text-xs text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="space-y-3 mb-5">
                    {/* Enrollment tabs + Search */}
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: "all", label: "All Courses", icon: Globe, activeClass: "bg-blue-600" },
                                { key: "enrolled", label: `My Courses${enrolledCount > 0 ? ` (${enrolledCount})` : ""}`, icon: BookMarked, activeClass: "bg-green-600" },
                                { key: "available", label: "Discover", icon: Sparkles, activeClass: "bg-purple-600" },
                            ].map(f => (
                                <button key={f.key} onClick={() => setActiveFilter(f.key)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                                        activeFilter === f.key
                                            ? `${f.activeClass} text-white shadow-lg`
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                    }`}
                                >
                                    <f.icon className="w-4 h-4" /> {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 max-w-sm relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text" placeholder="Search courses..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Category chips */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Filter className="w-3 h-3" /> Category:</span>
                        <button onClick={() => { setCategoryFilter(""); setPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs transition ${!categoryFilter ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}>
                            All
                        </button>
                        {Object.entries(categoryConfig).map(([key, cfg]) => (
                            <button key={key} onClick={() => { setCategoryFilter(categoryFilter === key ? "" : key); setPage(1); }}
                                className={`px-3 py-1 rounded-full text-xs transition flex items-center gap-1 ${
                                    categoryFilter === key ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}>
                                {cfg.icon} {cfg.name}
                            </button>
                        ))}
                    </div>

                    {/* Difficulty chips */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-500">Difficulty:</span>
                        {[
                            { key: "", label: "All" },
                            { key: "beginner", label: "🌱 Beginner" },
                            { key: "intermediate", label: "⚡ Intermediate" },
                            { key: "advanced", label: "🔥 Advanced" },
                        ].map(d => (
                            <button key={d.key} onClick={() => { setDifficultyFilter(d.key); setPage(1); }}
                                className={`px-3 py-1 rounded-full text-xs transition ${
                                    difficultyFilter === d.key ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}>
                                {d.label}
                            </button>
                        ))}
                        {hasFilters && (
                            <button onClick={clearFilters}
                                className="ml-2 px-3 py-1 rounded-full text-xs bg-red-900/40 text-red-400 hover:bg-red-800/60 transition flex items-center gap-1">
                                <X className="w-3 h-3" /> Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-400 text-sm">Loading courses...</p>
                    </div>
                ) : displayCourses.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-gray-800/20 rounded-2xl border border-gray-700/30">
                        {activeFilter === "enrolled" ? (
                            <>
                                <BookMarked className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">No enrolled courses yet</h3>
                                <p className="text-gray-500 text-sm mb-4">Browse available courses and start learning!</p>
                                <button onClick={() => setActiveFilter("all")} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                                    Browse All Courses
                                </button>
                            </>
                        ) : hasFilters ? (
                            <>
                                <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">No matching courses</h3>
                                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search term.</p>
                                <button onClick={clearFilters} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                                    Clear Filters
                                </button>
                            </>
                        ) : (
                            <>
                                <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">No courses available yet</h3>
                                <p className="text-gray-500 text-sm">Check back later for new content.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-gray-500 mb-3">
                            {activeFilter === "enrolled"
                                ? `${displayCourses.length} enrolled course${displayCourses.length !== 1 ? "s" : ""}`
                                : `Showing ${displayCourses.length}${pagination && activeFilter === "all" ? ` of ${pagination.total}` : ""} courses`}
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayCourses.map((course, i) => {
                                const isEnrolled = course.enrolled || enrolledIds.has(course._id);
                                const cfg = categoryConfig[course.category] || categoryConfig.other;
                                return (
                                    <motion.div key={course._id || i}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/30 hover:border-blue-500/30 hover:bg-gray-800/60 transition group cursor-pointer"
                                        onClick={() => !isEnrolled && setDetailCourse({ ...course, enrolled: false })}
                                    >
                                        {/* Thumbnail */}
                                        <div className={`h-32 bg-gradient-to-br ${cfg.color} relative flex items-center justify-center`}>
                                            <span className="text-4xl group-hover:scale-110 transition">{cfg.icon}</span>
                                            {isEnrolled && course.progress > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                                    <div className="h-full bg-green-400" style={{ width: `${course.progress}%` }} />
                                                </div>
                                            )}
                                            {isEnrolled && (
                                                <div className="absolute top-2 right-2 bg-green-600/80 text-white text-xs px-2 py-0.5 rounded-full">
                                                    Enrolled
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[course.difficulty] || difficultyColors.all}`}>
                                                {difficultyLabel[course.difficulty] || "📚 All Levels"}
                                            </span>

                                            <h3 className="font-bold text-sm mt-2 mb-1 line-clamp-2 leading-snug">{course.title}</h3>
                                            <p className="text-gray-400 text-xs mb-3">by {course.instructor?.name || "Instructor"}</p>

                                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round((course.totalDurationSec || 0) / 3600)}h</span>
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrollmentCount || 0}</span>
                                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons?.length || 0} lessons</span>
                                            </div>

                                            {isEnrolled && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                        <span>Progress</span>
                                                        <span className="text-green-400">{course.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500" style={{ width: `${course.progress || 0}%` }} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-blue-400 text-sm">
                                                    {course.pricing?.oneTime?.price > 0 ? `R ${course.pricing.oneTime.price}` : "Free"}
                                                </span>
                                                <button
                                                    onClick={e => { e.stopPropagation(); isEnrolled ? openPlayer(course) : setDetailCourse({ ...course, enrolled: false }); }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                                        isEnrolled ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                                >
                                                    {isEnrolled ? <><Play className="w-3 h-3" /> Continue</> : <>Enroll <ChevronRight className="w-3 h-3" /></>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {activeFilter === "all" && pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-40 transition">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-400">Page {page} of {pagination.pages}</span>
                                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-40 transition">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {playerCourse && (
                    <CoursePlayerModal course={playerCourse} onClose={() => setPlayerCourse(null)} />
                )}
                {detailCourse && (
                    <CourseDetailModal
                        course={detailCourse}
                        enrolled={enrolledIds.has(detailCourse._id)}
                        onEnroll={handleEnroll}
                        onClose={() => setDetailCourse(null)}
                    />
                )}
            </AnimatePresence>

            {paymentCourse && (
                <Elements stripe={stripePromise}>
                    <CoursePaymentModal
                        course={paymentCourse}
                        onClose={() => setPaymentCourse(null)}
                        onSuccess={async () => {
                            toast.success("Enrolled! 🎉");
                            setPaymentCourse(null);
                            await loadData();
                            setActiveFilter("enrolled");
                        }}
                    />
                </Elements>
            )}
        </div>
    );
};

export default Learn;
