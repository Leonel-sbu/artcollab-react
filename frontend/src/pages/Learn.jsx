// src/pages/Learn.jsx
import { BookOpen, Video, Award, Clock, Users, Play } from 'lucide-react'

const Learn = () => {
    const courses = [
        { title: "Digital Painting Fundamentals", instructor: "Sarah Chen", duration: "8h", students: 1245 },
        { title: "3D Modeling for Beginners", instructor: "Alex Rivera", duration: "12h", students: 892 },
        { title: "AI Art Masterclass", instructor: "Maya Patel", duration: "6h", students: 2103 },
        { title: "NFT Creation & Marketing", instructor: "Jordan Lee", duration: "10h", students: 1567 },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-6">Learn Digital Art</h1>
                    <p className="text-gray-300 text-xl max-w-3xl mx-auto">
                        Professional courses and workshops from industry-leading artists.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-gray-400">Courses</div>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                        <Users className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                        <div className="text-3xl font-bold">10K+</div>
                        <div className="text-gray-400">Students</div>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                        <Video className="w-12 h-12 mx-auto mb-3 text-green-400" />
                        <div className="text-3xl font-bold">200+</div>
                        <div className="text-gray-400">Hours</div>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                        <Award className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                        <div className="text-3xl font-bold">25+</div>
                        <div className="text-gray-400">Instructors</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {courses.map((course, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-2xl overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-blue-900/30 to-purple-900/30 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="w-12 h-12 text-white/50" />
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                <p className="text-gray-400 mb-4">by {course.instructor}</p>
                                <div className="flex justify-between text-sm text-gray-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {course.duration}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {course.students}
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Learn