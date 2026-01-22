// src/components/marketplace/ArtworkCard.jsx
import { Heart, Eye, ShoppingCart } from 'lucide-react'

const ArtworkCard = ({ artwork, onBuy, onLike }) => {
    return (
        <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]">
            {/* Artwork Image */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                        <button
                            onClick={onBuy}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                    {artwork.isFeatured && (
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full">
                            Featured
                        </span>
                    )}
                    <span className="px-3 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-sm rounded-full">
                        {artwork.category}
                    </span>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                        onClick={onLike}
                        className="p-2 bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-red-500/20 hover:text-red-400 transition"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-blue-500/20 hover:text-blue-400 transition">
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Artwork Details */}
            <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                    <img
                        src={artwork.artistAvatar}
                        alt={artwork.artist}
                        className="w-10 h-10 rounded-full border-2 border-blue-500/50"
                    />
                    <div>
                        <h3 className="font-bold text-lg line-clamp-1">{artwork.title}</h3>
                        <p className="text-gray-400 text-sm">by {artwork.artist}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{artwork.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{artwork.views.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-900 rounded">
                        {artwork.createdAt}
                    </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-bold text-white">{artwork.price}</div>
                        <div className="text-sm text-gray-400">{artwork.priceUSD}</div>
                    </div>
                    <button
                        onClick={onBuy}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ArtworkCard