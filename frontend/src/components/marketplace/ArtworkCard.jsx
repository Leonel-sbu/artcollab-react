import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/helpers";

export default function ArtworkCard({ artwork }) {
  if (!artwork) return null;
  const id = artwork?._id || artwork?.id;

  return (
    <Link to={`/artworks/${id}`} className="block rounded-2xl border bg-white p-4 hover:shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {artwork?.imageUrl ? (
          <img src={artwork.imageUrl} alt={artwork?.title || "Artwork"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm font-semibold">{artwork?.title || "Untitled"}</div>
        <div className="mt-1 text-xs text-gray-600">{artwork?.artistName || artwork?.creator?.name || "Artist"}</div>
        <div className="mt-2 text-sm">{formatCurrency(artwork?.price || 0)}</div>
      </div>
    </Link>
  );
}
