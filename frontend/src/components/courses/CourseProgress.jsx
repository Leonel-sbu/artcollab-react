export default function CourseProgress({ progress = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(progress || 0)));
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Progress</div>
      <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-black" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-xs text-gray-600">{pct}% completed</div>
    </div>
  );
}
