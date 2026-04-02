import CourseCard from "../courses/CourseCard";

export default function ContinueLearning({ courses, onContinue, onView }) {
    const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100);

    if (inProgressCourses.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Continue Learning</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                {inProgressCourses.map(course => (
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
