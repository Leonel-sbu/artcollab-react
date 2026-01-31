import { useParams } from "react-router-dom";

export default function OrderDetails() {
  const params = useParams();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold">OrderDetails</h1>
        <p className="mt-2 text-sm text-gray-600">Params: {JSON.stringify(params)}</p>
        <p className="mt-4 text-sm text-gray-700">
          Placeholder page generated automatically. Replace with real UI/data fetch.
        </p>
      </div>
    </div>
  );
}
