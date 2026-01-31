import ArtworkCard from "./ArtworkCard";

export default function ArtworkGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(items || []).map((a) => (
        <ArtworkCard key={a?._id || a?.id} artwork={a} />
      ))}
    </div>
  );
}
