// src/pages/Marketplace.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Filter, Search, TrendingUp, Clock, Heart, ShoppingCart, Eye } from 'lucide-react'
import ArtworkCard from '../components/marketplace/ArtworkCard'

const Marketplace = () => {
  const { user } = useAuth()
  const [artworks, setArtworks] = useState([])
  const [filteredArtworks, setFilteredArtworks] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Abstract', 'Digital', '3D', 'Generative', 'Illustration', 'Photography', 'Animation', 'Street']

  useEffect(() => {
    // Fetch artworks from API
    const fetchArtworks = async () => {
      try {
        // Mock data - replace with real API call
        const mockArtworks = [
          {
            id: 1,
            title: 'Digital Dreams',
            artist: 'Sarah Chen',
            artistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            price: '0.5 ETH',
            priceUSD: '$1,750',
            category: 'Abstract',
            imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
            likes: 234,
            views: 1250,
            isFeatured: true,
            createdAt: '2024-01-15'
          },
          {
            id: 2,
            title: 'Neon Symphony',
            artist: 'Marcus Rio',
            artistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
            price: '1.2 ETH',
            priceUSD: '$4,200',
            category: 'Digital',
            imageUrl: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=400&fit=crop',
            likes: 189,
            views: 890,
            isFeatured: true,
            createdAt: '2024-01-14'
          },
          {
            id: 3,
            title: 'Cosmic Dance',
            artist: 'Lena Park',
            artistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena',
            price: '0.8 ETH',
            priceUSD: '$2,800',
            category: '3D',
            imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w-400&h=400&fit=crop',
            likes: 312,
            views: 1560,
            isFeatured: false,
            createdAt: '2024-01-13'
          },
          {
            id: 4,
            title: 'Eternal Flow',
            artist: 'David Zhao',
            artistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            price: '2.1 ETH',
            priceUSD: '$7,350',
            category: 'Abstract',
            imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
            likes: 156,
            views: 780,
            isFeatured: true,
            createdAt: '2024-01-12'
          },
          {
            id: 5,
            title: 'Urban Echoes',
            artist: 'Alex Morgan',
            artistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            price: '0.7 ETH',
            priceUSD: '$2,450',
            category: 'Street',
            imageUrl: 'https://images.unsplash.com/photo-1543857778-c4a1a569e388?w=400&h=400&fit=crop',
            likes: 278,
            views: 1340,
            isFeatured: false,
            createdAt: '2024-01-11'
          },
          {
            id: 6,
            title: 'AI Genesis',
            artist: 'Maya Patel',
            artistAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
            price: '1.5 ETH',
            priceUSD: '$5,250',
            category: 'Generative',
            imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
            likes: 421,
            views: 2100,
            isFeatured: true,
            createdAt: '2024-01-10'
          }
        ]

        setArtworks(mockArtworks)
        setFilteredArtworks(mockArtworks)
      } catch (error) {
        console.error('Error fetching artworks:', error)
        toast.error('Failed to load artworks')
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  useEffect(() => {
    let result = [...artworks]

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(artwork => artwork.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(artwork =>
        artwork.title.toLowerCase().includes(term) ||
        artwork.artist.toLowerCase().includes(term) ||
        artwork.category.toLowerCase().includes(term)
      )
    }

    // Sort artworks
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'popular':
        result.sort((a, b) => b.likes - a.likes)
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      default: // featured
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }

    setFilteredArtworks(result)
  }, [artworks, selectedCategory, searchTerm, sortBy])

  const handleBuyArtwork = (artworkId) => {
    if (!user) {
      toast.error('Please login to purchase artwork')
      return
    }
    toast.success(`Added "${artworks.find(a => a.id === artworkId)?.title}" to cart!`)
    // In a real app, you would add to cart/checkout
  }

  const handleLikeArtwork = (artworkId) => {
    if (!user) {
      toast.error('Please login to like artwork')
      return
    }
    setArtworks(prev => prev.map(artwork =>
      artwork.id === artworkId
        ? { ...artwork, likes: artwork.likes + 1 }
        : artwork
    ))
    toast.success('Artwork liked!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Digital Art Marketplace
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Discover and collect unique digital artworks from talented artists worldwide
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-800/50 p-4 rounded-2xl">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <option value="featured">Featured</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-2xl font-bold">{artworks.length}</div>
            <div className="text-gray-400">Total Artworks</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-2xl font-bold">
              {artworks.reduce((sum, art) => sum + art.likes, 0).toLocaleString()}
            </div>
            <div className="text-gray-400">Total Likes</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <div className="text-gray-400">Categories</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-2xl font-bold">
              {[...new Set(artworks.map(a => a.artist))].length}
            </div>
            <div className="text-gray-400">Artists</div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-400">
                Showing {filteredArtworks.length} of {artworks.length} artworks
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${sortBy === 'recent' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800'}`}
                >
                  <Clock className="w-4 h-4" />
                  Recent
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${sortBy === 'popular' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800'}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Popular
                </button>
              </div>
            </div>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onBuy={() => handleBuyArtwork(artwork.id)}
                  onLike={() => handleLikeArtwork(artwork.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredArtworks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-2">No artworks found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All')
                    setSearchTerm('')
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Featured Collections */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">Abstract Masters</h3>
              <p className="text-gray-400 mb-4">Curated selection of abstract digital art</p>
              <div className="flex -space-x-3">
                {artworks.slice(0, 4).map(art => (
                  <img
                    key={art.id}
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-12 h-12 rounded-full border-2 border-gray-800 object-cover"
                  />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">3D Innovations</h3>
              <p className="text-gray-400 mb-4">Groundbreaking 3D artworks and animations</p>
              <div className="flex -space-x-3">
                {artworks.slice(2, 6).map(art => (
                  <img
                    key={art.id}
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-12 h-12 rounded-full border-2 border-gray-800 object-cover"
                  />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">AI Generated</h3>
              <p className="text-gray-400 mb-4">Artworks created with AI assistance</p>
              <div className="flex -space-x-3">
                {artworks.slice(4, 8).map(art => (
                  <img
                    key={art.id}
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-12 h-12 rounded-full border-2 border-gray-800 object-cover"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marketplace