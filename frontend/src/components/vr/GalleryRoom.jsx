// src/components/vr/GalleryRoom.jsx
import { useState, useEffect } from "react";
import { RotateCcw, ZoomIn, Info, Grid, List } from "lucide-react";

export default function GalleryRoom({ room, onArtworkSelect }) {
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [showDetails, setShowDetails] = useState(null);

    const artworks = room?.artworks || [];

    // Reset state when room changes
    useEffect(() => {
        setSelectedArtwork(null);
        setShowDetails(null);
    }, [room?._id]);

    const handleArtworkClick = (artwork) => {
        setSelectedArtwork(artwork);
        onArtworkSelect?.(artwork);
    };

    const handleShowDetails = (artwork, e) => {
        e.stopPropagation();
        setShowDetails(showDetails === artwork.id ? null : artwork.id);
    };

    if (!room) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-900/60 border border-gray-800 rounded-xl">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Grid className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400">Select a gallery room to view artworks</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Room Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{room.name}</h2>
                    <p className="text-gray-400">{artworks.length} artworks in this room</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition ${viewMode === "grid"
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition ${viewMode === "list"
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Artworks Display */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {artworks.map((artwork) => (
                        <div
                            key={artwork.id}
                            onClick={() => handleArtworkClick(artwork)}
                            className="group relative aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer"
                        >
                            <img
                                src={artwork.image}
                                alt={artwork.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="text-white font-medium truncate">{artwork.title}</h3>
                                    <p className="text-gray-400 text-sm truncate">{artwork.artist}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={(e) => handleShowDetails(artwork, e)}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
                                >
                                    <Info className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedArtwork(artwork);
                                    }}
                                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {showDetails === artwork.id && (
                                <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
                                    <div className="text-center">
                                        <h3 className="text-white font-bold text-lg mb-1">{artwork.title}</h3>
                                        <p className="text-gray-400 mb-2">by {artwork.artist}</p>
                                        <button
                                            onClick={(e) => handleShowDetails(artwork, e)}
                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {artworks.map((artwork) => (
                        <div
                            key={artwork.id}
                            onClick={() => handleArtworkClick(artwork)}
                            className="flex items-center gap-4 p-3 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-gray-700 cursor-pointer transition"
                        >
                            <img
                                src={artwork.image}
                                alt={artwork.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{artwork.title}</h3>
                                <p className="text-gray-400 text-sm truncate">{artwork.artist}</p>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                                <ZoomIn className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Artwork Modal */}
            {selectedArtwork && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
                    onClick={() => setSelectedArtwork(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                        onClick={() => setSelectedArtwork(null)}
                    >
                        ✕
                    </button>

                    <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedArtwork.image}
                            alt={selectedArtwork.title}
                            className="max-h-[80vh] mx-auto object-contain"
                        />
                        <div className="text-center mt-4">
                            <h3 className="text-2xl font-bold text-white">{selectedArtwork.title}</h3>
                            <p className="text-gray-400">by {selectedArtwork.artist}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
