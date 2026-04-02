import CourseCard from "../courses/CourseCard";

export default function MyCourses({ courses, onContinue, onView }) {
    if (courses.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                {courses.map(course => (
                    <div key={course._id} className="flex-shrink-0 w-80">
                        <CourseCard
                            course={course}
                            enrolled={true}
                            progress={course.progress || 0}
                            onContinue={() => onContinue(course._id)}
                            onView={() => onView(course._id)}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
