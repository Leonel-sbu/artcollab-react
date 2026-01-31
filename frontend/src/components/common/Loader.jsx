export default function Loader({ label = "Loading..." }) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          <div className="text-sm text-gray-700">{label}</div>
        </div>
      </div>
    </div>
  );
}
