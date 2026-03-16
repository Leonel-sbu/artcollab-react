// src/components/courses/CourseCard.jsx
import { Clock, Users, Play, BookOpen } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function resolveImageUrl(raw) {
    const u = String(raw || "").trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/uploads/")) return `${API_BASE}${u}`;
    if (u.startsWith("uploads/")) return `${API_BASE}/${u}`;
    return "";
}

export default function CourseCard({ course, onEnroll, onView }) {
    const {
        title,
        description,
        instructor,
        thumbnail,
        price,
        duration,
        lessons = [],
        enrolledCount = 0,
        level = "Beginner",
        category
    } = course || {};

    const safeTitle = title || "Untitled Course";
    const instructorName = instructor?.name || "Unknown Instructor";
    const instructorAvatar = instructor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(instructorName)}`;

    const imageUrl = resolveImageUrl(thumbnail);
    const fallbackImg = "https://picsum.photos/seed/course/800/450";
    const displayImg = imageUrl || fallbackImg;

    const lessonCount = Array.isArray(lessons) ? lessons.length : 0;
    const totalDuration = Array.isArray(lessons)
        ? lessons.reduce((acc, l) => acc + (l.duration || 0), 0)
        : 0;

    const formatDuration = (minutes) => {
        if (!minutes) return "0h";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className="group bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition cursor-pointer" onClick={onView}>
            {/* Thumbnail */}
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={displayImg}
                    alt={safeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => { e.target.src = fallbackImg; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category Badge */}
                {category && (
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-black/60 border border-white/10 text-white">
                            {category}
                        </span>
                    </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-16 h-16 rounded-full bg-blue-500/90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                </div>

                {/* Level Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${level === "Beginner" ? "bg-green-500/80" :
                            level === "Intermediate" ? "bg-yellow-500/80" :
                                "bg-red-500/80"
                        } text-white`}>
                        {level}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-white truncate mb-2">{safeTitle}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {description || "Learn the fundamentals and master new skills"}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={instructorAvatar}
                        alt={instructorName}
                        className="w-8 h-8 rounded-full border border-gray-700"
                    />
                    <span className="text-gray-300 text-sm">{instructorName}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{lessonCount} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{enrolledCount}</span>
                    </div>
                </div>

                {/* Price & Enroll */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                    <div className="text-xl font-bold text-white">
                        {price === 0 ? "Free" : `R ${price?.toLocaleString()}`}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEnroll?.();
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition"
                    >
                        {price === 0 ? "Start Learning" : "Enroll Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}
