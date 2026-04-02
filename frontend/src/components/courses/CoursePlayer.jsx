// src/components/courses/CoursePlayer.jsx
import { useState, useEffect } from "react";
import { Play, Pause, CheckCircle, Lock, ChevronRight, Menu, X, Volume2, VolumeX, Maximize } from "lucide-react";

function getEmbedUrl(url) {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    // Direct video file
    return null;
}

export default function CoursePlayer({ course, currentLesson, progress, onCompleteLesson, onSelectLesson }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const lessons = course?.lessons || [];
    const activeLesson = currentLesson || lessons[0] || {};

    const { title, videoUrl, description } = activeLesson;

    // Simulate video progress
    useEffect(() => {
        let interval;
        if (isPlaying && currentTime < duration) {
            interval = setInterval(() => {
                setCurrentTime((prev) => {
                    const newTime = prev + 1;
                    if (newTime >= duration) {
                        setIsPlaying(false);
                        onCompleteLesson?.(activeLesson._id);
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTime, duration, activeLesson]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleMute = () => setIsMuted(!isMuted);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const isLessonCompleted = (lessonId) => {
        return progress?.completedLessons?.includes(lessonId);
    };

    const isLessonUnlocked = (index) => {
        if (index === 0) return true;
        const prevLesson = lessons[index - 1];
        return isLessonCompleted(prevLesson?._id);
    };

    const handleLessonSelect = (lesson, index) => {
        if (isLessonUnlocked(index)) {
            setCurrentTime(0);
            setDuration(lesson.durationSec || 300);
            onSelectLesson?.(lesson);
        }
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!course) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900 rounded-xl">
                <p className="text-gray-400">Select a course to start learning</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Video Area */}
            <div className="flex-1">
                <div className="bg-black rounded-xl overflow-hidden relative">
                    {/* Video Player */}
                    <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                        {videoUrl && getEmbedUrl(videoUrl) ? (
                            // YouTube or Vimeo — use iframe embed
                            <iframe
                                key={videoUrl}
                                src={getEmbedUrl(videoUrl)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={title || 'Lesson video'}
                            />
                        ) : videoUrl ? (
                            // Direct video file (MP4, WebM, etc.)
                            <>
                                <video
                                    key={videoUrl}
                                    src={videoUrl}
                                    className="w-full h-full object-contain"
                                    onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                                    onEnded={() => onCompleteLesson?.(activeLesson._id)}
                                    muted={isMuted}
                                />
                                <button
                                    onClick={togglePlay}
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
                                >
                                    <div className="w-20 h-20 rounded-full bg-blue-500/90 flex items-center justify-center">
                                        {isPlaying ? (
                                            <Pause className="w-10 h-10 text-white" />
                                        ) : (
                                            <Play className="w-10 h-10 text-white ml-1" />
                                        )}
                                    </div>
                                </button>
                            </>
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                    <Play className="w-10 h-10 text-gray-500" />
                                </div>
                                <p className="text-gray-400">No video for this lesson</p>
                            </div>
                        )}
                    </div>

                    {/* Video Controls */}
                    <div className="bg-gray-900 p-4">
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={togglePlay}
                                    className="p-2 text-white hover:text-blue-400 transition"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>

                                <button
                                    onClick={toggleMute}
                                    className="p-2 text-white hover:text-blue-400 transition"
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>

                                <span className="text-white text-sm">{title || "Select a lesson"}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="p-2 text-white hover:text-blue-400 transition"
                                >
                                    {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                                <button className="p-2 text-white hover:text-blue-400 transition">
                                    <Maximize className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lesson Info */}
                <div className="mt-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{title || "Welcome to the Course"}</h2>
                    <p className="text-gray-400">{description || "Select a lesson from the sidebar to begin learning"}</p>
                </div>
            </div>

            {/* Lessons Sidebar */}
            {showSidebar && (
                <div className="w-full lg:w-80 bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="text-lg font-bold text-white">Course Content</h3>
                        <p className="text-sm text-gray-400">{lessons.length} lessons</p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {lessons.map((lesson, index) => {
                            const completed = isLessonCompleted(lesson._id);
                            const unlocked = isLessonUnlocked(index);
                            const isActive = activeLesson._id === lesson._id;

                            return (
                                <button
                                    key={lesson._id || index}
                                    onClick={() => handleLessonSelect(lesson, index)}
                                    disabled={!unlocked}
                                    className={`w-full p-4 flex items-start gap-3 text-left hover:bg-gray-800/50 transition ${isActive ? "bg-blue-500/10 border-l-4 border-blue-500" : ""} ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <div className="mt-0.5">
                                        {completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : unlocked ? (
                                            <div className={`w-5 h-5 rounded-full border-2 ${isActive ? "border-blue-500" : "border-gray-500"}`} />
                                        ) : (
                                            <Lock className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isActive ? "text-blue-400" : "text-white"}`}>
                                            {index + 1}. {lesson.title || "Untitled Lesson"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {lesson.durationSec ? `${Math.floor(lesson.durationSec / 60)} min` : "0 min"}
                                        </p>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-blue-500 mt-1" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
