// src/components/cart/CartItem.jsx
import { Trash2, Minus, Plus } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function resolveImageUrl(raw) {
    const u = String(raw || "").trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/uploads/")) return `${API_BASE}${u}`;
    if (u.startsWith("uploads/")) return `${API_BASE}/${u}`;
    return "";
}

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    const {
        _id,
        artwork,
        quantity = 1
    } = item || {};

    const artworkData = artwork || {};
    const title = artworkData.title || "Untitled Artwork";
    const artist = artworkData.artist?.name || "Unknown Artist";
    const price = artworkData.price || 0;
    const imageUrl = resolveImageUrl(artworkData.imageUrl);

    const fallbackImg = "https://picsum.photos/seed/cart/400/300";
    const displayImg = imageUrl || fallbackImg;

    const handleIncrement = () => {
        onUpdateQuantity?.(_id, quantity + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            onUpdateQuantity?.(_id, quantity - 1);
        }
    };

    const handleRemove = () => {
        onRemove?.(_id);
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-gray-900/60 border border-gray-800 rounded-xl hover:border-gray-700 transition">
            {/* Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                    src={displayImg}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = fallbackImg; }}
                />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{title}</h3>
                <p className="text-gray-400 text-sm">by {artist}</p>
                <p className="text-blue-400 font-bold mt-1">R {price.toLocaleString()}</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-800 rounded-lg">
                    <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-white font-medium">{quantity}</span>
                    <button
                        onClick={handleIncrement}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Remove Button */}
                <button
                    onClick={handleRemove}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove item"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Item Total */}
            <div className="text-right">
                <p className="text-white font-bold text-lg">R {(price * quantity).toLocaleString()}</p>
            </div>
        </div>
    );
}
