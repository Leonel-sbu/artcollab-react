export default function ArtworkFilters({ query, setQuery }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Filters</div>
      <input
        className="mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
        placeholder="Search artworks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-2 text-xs text-gray-500">More filters can be added (category, price range, etc).</div>
    </div>
  );
}
