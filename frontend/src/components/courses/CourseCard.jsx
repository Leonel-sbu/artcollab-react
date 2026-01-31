import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/helpers";

export default function CourseCard({ course }) {
  if (!course) return null;
  const id = course?._id || course?.id;

  return (
    <Link to={`/courses/${id}`} className="block rounded-2xl border bg-white p-4 hover:shadow-sm">
      <div className="text-sm font-semibold">{course?.title || "Course"}</div>
      <div className="mt-1 text-xs text-gray-600">{course?.instructorName || course?.instructor?.name || "Instructor"}</div>
      <div className="mt-2 text-sm">{formatCurrency(course?.price || 0)}</div>
    </Link>
  );
}
