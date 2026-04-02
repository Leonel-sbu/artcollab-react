import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, ArrowLeft, User, Calendar, Tag, DollarSign, FileText, Eye } from "lucide-react";
import { getArtworkById, toggleArtworkLike, incrementArtworkView } from "../services/artworkService";
import { cartService } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function resolveImageUrl(raw) {
    const u = String(raw || "").trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/uploads/")) return `${API_BASE}${u}`;
    if (u.startsWith("uploads/")) return `${API_BASE}/${u}`;
    return "";
}

export default function ArtworkDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    // Load artwork data
    useEffect(() => {
        const loadArtwork = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getArtworkById(id);

                if (!res?.success) {
                    throw new Error(res?.message || "Failed to load artwork");
                }

                setArtwork(res.item);

                // Increment view count in background (don't wait for it)
                incrementArtworkView(id).catch(() => { });
            } catch (e) {
                console.error("Artwork load error:", e);
                setError(e?.message || "Failed to load artwork");
                toast.error(e?.message || "Failed to load artwork");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadArtwork();
        }
    }, [id]);

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }

        try {
            setAddingToCart(true);
            await cartService.addItem(artwork._id);
            toast.success("Added to cart!");
        } catch (e) {
            console.error("Add to cart error:", e);
            toast.error(e?.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    // Handle like
    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like artworks");
            navigate("/login");
            return;
        }

        try {
            const res = await toggleArtworkLike(artwork._id);
            if (res?.success) {
                setArtwork(prev => ({
                    ...prev,
                    likes: res.likes
                }));
                toast.success(res.liked ? "Liked!" : "Unliked");
            }
        } catch (e) {
            console.error("Like error:", e);
            toast.error("Failed to like artwork");
        }
    };

    // Resolve image URL
    const imageUrl = useMemo(() => {
        return resolveImageUrl(artwork?.imageUrl) || "https://picsum.photos/seed/artcollab/900/600";
    }, [artwork?.imageUrl]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Error state
    if (error || !artwork) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <p className="text-red-400 mb-4">{error || "Artwork not found"}</p>
                <button
                    onClick={() => navigate("/marketplace")}
                    className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                    Back to Marketplace
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <button
                    onClick={() => navigate("/marketplace")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Marketplace
                </button>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
                            <img
                                src={imageUrl}
                                alt={artwork.title}
                                className="w-full h-auto object-cover"
                                onError={(e) => {
                                    e.target.src = "https://picsum.photos/seed/artcollab/900/600";
                                }}
                            />

                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-black/60 border border-white/10 text-white">
                                    {artwork.category || "Art"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        {/* Title & Artist */}
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{artwork.title}</h1>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {artwork.artist?.name || "Unknown Artist"}
                                    </p>
                                    <p className="text-gray-400 text-sm">Artist</p>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-baseline gap-2">
                                <DollarSign className="w-6 h-6 text-green-400" />
                                <span className="text-4xl font-bold text-white">
                                    {Number(artwork.price || 0).toLocaleString("en-ZA")}
                                </span>
                                <span className="text-gray-400">{artwork.currency || "ZAR"}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {addingToCart ? "Adding..." : "Add to Cart"}
                            </button>
                            <button
                                onClick={handleLike}
                                className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700"
                            >
                                <Heart className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm">License</span>
                                </div>
                                <p className="text-white font-medium capitalize">{artwork.licenseType || "Personal"}</p>
                            </div>

                            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <Tag className="w-4 h-4" />
                                    <span className="text-sm">Exclusive</span>
                                </div>
                                <p className="text-white font-medium">{artwork.isExclusive ? "Yes" : "No"}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {artwork.description || "No description available."}
                            </p>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-6 text-gray-400 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(artwork.createdAt).toLocaleDateString("en-ZA")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-400" />
                                <span>{artwork.likes || 0} likes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-400" />
                                <span>{artwork.views || 0} views</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
