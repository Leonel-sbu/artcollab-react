export default function ArtworkModeration({ artworks = [] }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Artwork Moderation</div>
      <div className="mt-3 text-sm text-gray-600">
        Placeholder. Next we will wire admin endpoints (approve/reject).
      </div>

      <div className="mt-3 space-y-2">
        {artworks.slice(0, 10).map((a) => (
          <div key={a._id || a.id} className="rounded-xl border p-3">
            <div className="text-sm font-medium">{a.title || "Artwork"}</div>
            <div className="text-xs text-gray-600">{a._id || a.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
