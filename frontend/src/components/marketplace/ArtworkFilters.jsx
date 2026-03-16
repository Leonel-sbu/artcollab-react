import { Search, Filter, X } from "lucide-react";

export default function ArtworkFilters({
    categories = [],
    selectedCategory = "All",
    onCategoryChange,
    searchTerm = "",
    onSearchChange,
    sortBy = "recent",
    onSortChange,
    priceRange = { min: 0, max: 10000 },
    onPriceRangeChange,
    onClearFilters,
    totalResults = 0,
}) {
    const sortOptions = [
        { value: "recent", label: "Most Recent" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "popular", label: "Most Popular" },
        { value: "rating", label: "Highest Rated" },
    ];

    const hasActiveFilters =
        selectedCategory !== "All" ||
        searchTerm.trim() !== "" ||
        priceRange.min > 0 ||
        priceRange.max < 10000;

    return (
        <div className="space-y-6">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => onCategoryChange?.(category)}
                        className={`px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === category
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Search + Sort + Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-800/50 p-4 rounded-2xl">
                {/* Search */}
                <div className="flex-1 w-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search artworks, artists, or categories..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => onSearchChange?.("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-4">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange?.(e.target.value)}
                        className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Price Range Button */}
                    <button
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${priceRange.min > 0 || priceRange.max < 10000
                                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                : "bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-300"
                            }`}
                        onClick={() => {
                            // Toggle price filter modal or inline controls
                            const newMin = priceRange.min > 0 ? 0 : 0;
                            const newMax = priceRange.max < 10000 ? 10000 : 10000;
                            onPriceRangeChange?.({ min: newMin, max: newMax });
                        }}
                    >
                        <Filter className="w-4 h-4" />
                        Price
                    </button>
                </div>
            </div>

            {/* Price Range Slider (inline) */}
            {(priceRange.min > 0 || priceRange.max < 10000) && (
                <div className="bg-gray-800/30 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Price Range</span>
                        <span className="text-sm text-white">
                            R {priceRange.min.toLocaleString("en-ZA")} - R{" "}
                            {priceRange.max.toLocaleString("en-ZA")}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={priceRange.min}
                            onChange={(e) =>
                                onPriceRangeChange?.({
                                    min: Math.min(Number(e.target.value), priceRange.max - 100),
                                    max: priceRange.max,
                                })
                            }
                            className="flex-1 accent-blue-500"
                        />
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={priceRange.max}
                            onChange={(e) =>
                                onPriceRangeChange?.({
                                    min: priceRange.min,
                                    max: Math.max(Number(e.target.value), priceRange.min + 100),
                                })
                            }
                            className="flex-1 accent-blue-500"
                        />
                    </div>
                </div>
            )}

            {/* Results Count + Clear */}
            {hasActiveFilters && (
                <div className="flex justify-between items-center">
                    <div className="text-gray-400">
                        Showing {totalResults} result{totalResults !== 1 ? "s" : ""}
                    </div>
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}
