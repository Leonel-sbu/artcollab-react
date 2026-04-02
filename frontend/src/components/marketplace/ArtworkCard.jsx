// src/components/marketplace/ArtworkCard.jsx
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";

// Use empty string for development (uses Vite proxy)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function resolveImageUrl(raw) {
    const u = String(raw || "").trim();
    if (!u) return "";

    if (u.startsWith("http://") || u.startsWith("https://")) return u;

    // only allow uploads paths (avoid /Capture001, /gcyf, etc.)
    if (u.startsWith("/uploads/")) return `${API_BASE}${u}`;
    if (u.startsWith("uploads/")) return `${API_BASE}/${u}`;

    return "";
}

export default function ArtworkCard({ artwork, onLike, onBuy, onView }) {
    const {
        title,
        artist,
        artistAvatar,
        price,
        category,
        imageUrl,
        likes = 0,
        views = 0,
        createdAt,
    } = artwork || {};

    const safeTitle = title || "Untitled";
    const safeArtist = artist || "Unknown Artist";
    const safeCategory = (category || "Other").trim() || "Other";

    const fallbackImg = "https://picsum.photos/seed/artcollab/900/600";

    const resolvedImg = useMemo(() => {
        return resolveImageUrl(imageUrl) || fallbackImg;
    }, [imageUrl]);

    const [imgSrc, setImgSrc] = useState(resolvedImg);

    // ✅ IMPORTANT: update state when resolvedImg changes
    useEffect(() => {
        setImgSrc(resolvedImg);
    }, [resolvedImg]);

    const stop = (fn) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        fn?.();
    };

    return (
        <div className="group relative bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500/40 transition">
            {/* Image */}
            <div className="relative h-64 w-full cursor-pointer" onClick={() => onView?.()}>
                <img
                    src={imgSrc}
                    alt={safeTitle}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setImgSrc(fallbackImg)}
                />

                {/* Category */}
                <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-black/60 border border-white/10 text-white">
                        {safeCategory}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <button
                        type="button"
                        onClick={stop(onLike)}
                        className="h-10 w-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-black/80"
                        title="Like"
                    >
                        <Heart className="w-5 h-5 text-white" />
                    </button>

                    <button
                        type="button"
                        onClick={stop(onView)}
                        className="h-10 w-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-black/80"
                        title="View"
                    >
                        <Eye className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60" />
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start gap-3">
                    <img
                        src={
                            artistAvatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeArtist)}`
                        }
                        alt={safeArtist}
                        className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800"
                    />

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate text-white">{safeTitle}</h3>
                        <p className="text-sm text-gray-400 truncate">by {safeArtist}</p>
                    </div>

                    {createdAt && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(createdAt).toLocaleDateString("en-ZA")}
                        </span>
                    )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-4 text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {likes}
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {views}
                    </div>
                </div>

                {/* Price + Buy */}
                <div className="flex justify-between items-center mt-5">
                    <div className="text-xl font-extrabold text-white">{price || "R 0"}</div>

                    <button
                        type="button"
                        onClick={stop(onBuy)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                    </button>
                </div>
            </div>
        </div>
    );
}
