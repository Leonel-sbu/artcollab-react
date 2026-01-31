export default function CoursePlayer({ url }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Course Player</div>
      {url ? (
        <div className="mt-3">
          <a className="text-sm underline" href={url} target="_blank" rel="noreferrer">
            Open content
          </a>
        </div>
      ) : (
        <div className="mt-3 text-sm text-gray-600">No video/content URL yet.</div>
      )}
    </div>
  );
}
