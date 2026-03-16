import { Clock, TrendingUp } from "lucide-react";
import ArtworkCard from "./ArtworkCard";

export default function ArtworkGrid({
    artworks = [],
    loading = false,
    sortBy = "recent",
    onSortChange,
    onView,
    onBuy,
    onLike,
    emptyMessage = "No artworks found",
    emptySubtext = "Try adjusting your search or filter criteria",
    onClearFilters,
}) {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (artworks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-2 text-white">{emptyMessage}</h3>
                <p className="text-gray-400 mb-6">{emptySubtext}</p>
                {onClearFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="text-gray-400">
                    Showing {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => onSortChange?.("recent")}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition ${sortBy === "recent"
                                ? "bg-blue-500/20 text-blue-400"
                                : "hover:bg-gray-800 text-gray-400"
                            }`}
                    >
                        <Clock className="w-4 h-4" />
                        Recent
                    </button>

                    <button
                        type="button"
                        onClick={() => onSortChange?.("popular")}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition ${sortBy === "popular"
                                ? "bg-blue-500/20 text-blue-400"
                                : "hover:bg-gray-800 text-gray-400"
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Popular
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                    <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        onView={() => onView?.(artwork.id)}
                        onBuy={() => onBuy?.(artwork.id)}
                        onLike={() => onLike?.(artwork.id)}
                    />
                ))}
            </div>
        </>
    );
}
