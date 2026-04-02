// src/components/vr/VRGallery.jsx
import { useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Maximize2, X, Info } from "lucide-react";

// Use empty string for development (uses Vite proxy)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function resolveImageUrl(raw) {
    const u = String(raw || "").trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/uploads/")) return `${API_BASE}${u}`;
    if (u.startsWith("uploads/")) return `${API_BASE}/${u}`;
    return "";
}

// Sample gallery rooms
const defaultRooms = [
    {
        id: 1,
        name: "Modern Art Collection",
        description: "Contemporary digital artworks",
        artworks: [
            { id: 1, title: "Digital Dreams", artist: "Alice Chen", image: "https://picsum.photos/seed/vr1/800/600" },
            { id: 2, title: "Neon City", artist: "Bob Smith", image: "https://picsum.photos/seed/vr2/800/600" },
            { id: 3, title: "Abstract Flow", artist: "Carol White", image: "https://picsum.photos/seed/vr3/800/600" },
        ]
    },
    {
        id: 2,
        name: "Classic Masters",
        description: "Traditional art reimagined",
        artworks: [
            { id: 4, title: "Sunset Valley", artist: "David Lee", image: "https://picsum.photos/seed/vr4/800/600" },
            { id: 5, title: "Mountain View", artist: "Emma Brown", image: "https://picsum.photos/seed/vr5/800/600" },
        ]
    },
    {
        id: 3,
        name: "3D Art Showcase",
        description: "Three-dimensional digital sculptures",
        artworks: [
            { id: 6, title: "Crystal Form", artist: "Frank Miller", image: "https://picsum.photos/seed/vr6/800/600" },
            { id: 7, title: "Geometric Dreams", artist: "Grace Kim", image: "https://picsum.photos/seed/vr7/800/600" },
            { id: 8, title: "Future Structure", artist: "Henry Park", image: "https://picsum.photos/seed/vr8/800/600" },
        ]
    }
];

export default function VRGallery({ rooms = defaultRooms }) {
    const [currentRoom, setCurrentRoom] = useState(0);
    const [currentArtwork, setCurrentArtwork] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const activeRoom = rooms[currentRoom] || {};
    const artworks = activeRoom.artworks || [];
    const activeArtwork = artworks[currentArtwork] || {};

    const handleNext = () => {
        if (currentArtwork < artworks.length - 1) {
            setCurrentArtwork(currentArtwork + 1);
        }
    };

    const handlePrev = () => {
        if (currentArtwork > 0) {
            setCurrentArtwork(currentArtwork - 1);
        }
    };

    const handleRoomChange = (index) => {
        setCurrentRoom(index);
        setCurrentArtwork(0);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`bg-gray-900 rounded-2xl overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : "relative"}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50">
                <div>
                    <h2 className="text-xl font-bold text-white">{activeRoom.name}</h2>
                    <p className="text-sm text-gray-400">{activeRoom.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main View */}
            <div className="relative aspect-video bg-black">
                {/* Artwork Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={activeArtwork.image}
                        alt={activeArtwork.title}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={handlePrev}
                    disabled={currentArtwork === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentArtwork === artworks.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Artwork Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="text-2xl font-bold text-white mb-1">{activeArtwork.title}</h3>
                    <p className="text-gray-300">by {activeArtwork.artist}</p>
                </div>

                {/* Counter */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                    {currentArtwork + 1} / {artworks.length}
                </div>
            </div>

            {/* Room Navigation */}
            <div className="p-4 bg-gray-800/30">
                <p className="text-sm text-gray-400 mb-3">Gallery Rooms</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {rooms.map((room, index) => (
                        <button
                            key={room.id}
                            onClick={() => handleRoomChange(index)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${currentRoom === index
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                                }`}
                        >
                            {room.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2 overflow-x-auto">
                    {artworks.map((artwork, index) => (
                        <button
                            key={artwork.id}
                            onClick={() => setCurrentArtwork(index)}
                            className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${currentArtwork === index
                                ? "border-blue-500"
                                : "border-transparent opacity-50 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={artwork.image}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                    <div className="bg-gray-900 p-6 rounded-xl max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">VR Gallery Controls</h3>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <ul className="space-y-2 text-gray-300">
                            <li>← → Arrow keys to navigate artworks</li>
                            <li>Click room buttons to switch galleries</li>
                            <li>Click thumbnails for quick navigation</li>
                            <li>Use fullscreen for immersive viewing</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Fullscreen Close */}
            {isFullscreen && (
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white z-20"
                >
                    <X className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
