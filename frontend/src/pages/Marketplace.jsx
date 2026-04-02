import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Filter, Search, TrendingUp, Clock } from "lucide-react";
import ArtworkCard from "../components/marketplace/ArtworkCard";
import InlineLoader from "../components/shared/InlineLoader";
import { getPublishedArtworks } from "../services/marketplaceService";
import { cartService, formatZAR } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

// If your API base is different, change it here.
// Use empty string for development (uses Vite proxy)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function normalizeCategory(v) {
  const c = String(v || "").trim();
  return c ? c : "Other";
}

function resolveImageUrl(raw) {
  const u = String(raw || "").trim();
  if (!u) return "";

  // already absolute
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  // if stored as "/uploads/xyz.jpg" or "uploads/xyz.jpg"
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);

  // ========
  // Load DB artworks
  // ========
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getPublishedArtworks();
        if (!res?.success) throw new Error(res?.message || "Failed to load artworks");
        setArtworks(Array.isArray(res.items) ? res.items : []);
      } catch (e) {
        console.error('Marketplace load error:', e);
        if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
          toast.error("Unable to connect to server. Please check your connection.");
        } else if (e.response?.status === 401) {
          toast.error("Please log in to view artworks.");
        } else if (e.response?.status === 403) {
          toast.error("Access denied.");
        } else {
          toast.error(e?.message || "Failed to load artworks");
        }
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ========
  // Categories from DB (stable + sorted)
  // ========
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    for (const a of artworks) set.add(normalizeCategory(a?.category));
    const arr = Array.from(set);
    return ["All", ...arr.filter((x) => x !== "All").sort((a, b) => a.localeCompare(b))];
  }, [artworks]);

  // ========
  // Filter + sort (DB shape)
  // ========
  const filteredArtworks = useMemo(() => {
    let result = Array.isArray(artworks) ? [...artworks] : [];

    if (selectedCategory !== "All") {
      result = result.filter((a) => normalizeCategory(a?.category) === selectedCategory);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((a) => {
        const title = String(a?.title || "").toLowerCase();
        const desc = String(a?.description || "").toLowerCase();
        const cat = String(a?.category || "").toLowerCase();
        const artistName = String(a?.artist?.name || "").toLowerCase();
        return title.includes(term) || desc.includes(term) || cat.includes(term) || artistName.includes(term);
      });
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    } else {
      result.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    }

    return result;
  }, [artworks, selectedCategory, searchTerm, sortBy]);

  // ========
  // Map DB artwork -> UI artwork for card
  // ========
  const uiArtworks = useMemo(() => {
    return filteredArtworks.map((a) => {
      const name = a?.artist?.name || "Unknown Artist";
      const seed = encodeURIComponent(name);
      const img = resolveImageUrl(a?.imageUrl);

      return {
        id: a?._id,
        title: a?.title || "Untitled",
        artist: name,
        artistAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        price: `R ${Number(a?.price || 0).toLocaleString("en-ZA")}`,
        category: normalizeCategory(a?.category),
        imageUrl: img || "https://picsum.photos/seed/artcollab/900/600",
        likes: Number(a?.likes || 0),
        views: Number(a?.views || 0),
        createdAt: a?.createdAt,
      };
    });
  }, [filteredArtworks]);

  // ========
  // Reaction handlers
  // ========
  const handleView = useCallback((id) => {
    navigate(`/artwork/${id}`);
  }, [navigate]);

  const handleBuy = useCallback(async (id) => {
    const artwork = artworks.find(a => a._id === id);
    if (!artwork) return;

    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const price = typeof artwork.price === 'string'
        ? parseFloat(artwork.price.replace(/[^0-9.-]+/g, ''))
        : artwork.price || 0;

      const cartItem = {
        kind: 'artwork',
        refId: artwork._id,
        title: artwork.title,
        artist: artwork.artist?.name || artwork.artist || 'Unknown',
        price: price,
        qty: 1,
        image: artwork.imageUrl
      };

      await cartService.addToCart(cartItem);
      toast.success(`${artwork.title} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  }, [artworks, user]);

  const handleLike = useCallback((id) => {
    setArtworks((prev) =>
      prev.map((a) => (a?._id === id ? { ...a, likes: Number(a?.likes || 0) + 1 } : a))
    );
    toast.success("Liked!");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Digital Art Marketplace
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Discover and collect artworks uploaded by artists on ArtCollab
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === category
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-800/50 p-4 rounded-2xl">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artworks, artists, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button
                type="button"
                onClick={() => toast("More filters later (price range, tags, etc.)")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <InlineLoader />
        ) : (
          <>
            {/* Results */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-400">
                Showing {uiArtworks.length} of {artworks.length} artworks
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSortBy("recent")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${sortBy === "recent" ? "bg-blue-500/20 text-blue-400" : "hover:bg-gray-800"
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  Recent
                </button>

                <button
                  type="button"
                  onClick={() => toast("Popular sorting can be enabled once we store likes/views")}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-800"
                >
                  <TrendingUp className="w-4 h-4" />
                  Popular
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uiArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onView={() => handleView(artwork.id)}
                  onBuy={() => handleBuy(artwork.id)}
                  onLike={() => handleLike(artwork.id)}
                />
              ))}
            </div>

            {/* Empty */}
            {uiArtworks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">No artworks found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchTerm("");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
