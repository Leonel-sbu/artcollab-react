import { useState } from "react";
import { Search, Filter } from "lucide-react";
import CourseCard from "../courses/CourseCard";

export default function DiscoverCourses({
    courses,
    onEnroll,
    onView,
    loading
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");

    const levels = ["All", "Beginner", "Intermediate", "Advanced"];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === "All" ||
            course.difficulty?.toLowerCase() === levelFilter.toLowerCase();
        return matchesSearch && matchesLevel;
    });

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Discover Courses</h2>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <div className="flex gap-2">
                        {levels.map(level => (
                            <button
                                key={level}
                                onClick={() => setLevelFilter(level)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${levelFilter === level
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-900 rounded-2xl h-80 animate-pulse" />
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No courses found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard
                            key={course._id}
                            course={course}
                            enrolled={course.enrolled || false}
                            progress={course.progress || 0}
                            onEnroll={() => onEnroll(course._id)}
                            onView={() => onView(course._id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
