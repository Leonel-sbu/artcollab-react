export default function PostSkeleton() {
  return (
    <div className="bg-gray-800 p-4 rounded-xl animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-3 bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-2 bg-gray-700 rounded w-1/4" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-700 rounded w-2/3" />
      </div>

      <div className="h-40 bg-gray-700 rounded mb-4" />

      <div className="flex gap-6">
        <div className="h-4 w-10 bg-gray-700 rounded" />
        <div className="h-4 w-14 bg-gray-700 rounded" />
      </div>
    </div>
  );
}
