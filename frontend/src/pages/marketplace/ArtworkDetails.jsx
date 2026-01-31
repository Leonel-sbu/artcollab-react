import { useParams } from "react-router-dom";

export default function ArtworkDetails() {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold">Artwork Details</h1>
        <p className="mt-2 text-sm text-gray-600">
          Artwork ID: {id}
        </p>
        <p className="mt-4 text-sm text-gray-700">
          This is a placeholder. Next we will fetch artwork data from the backend.
        </p>
      </div>
    </div>
  );
}
