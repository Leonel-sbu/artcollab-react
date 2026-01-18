import { useAuth } from '../context/AuthContext'

const Marketplace = () => {
  const { user } = useAuth()

  const artworks = [
    { id: 1, title: 'Digital Dreams', artist: 'Sarah Chen', price: '0.5 ETH', category: 'Abstract' },
    { id: 2, title: 'Neon Symphony', artist: 'Marcus Rio', price: '1.2 ETH', category: 'Digital' },
    { id: 3, title: 'Cosmic Dance', artist: 'Lena Park', price: '0.8 ETH', category: '3D' },
    { id: 4, title: 'Eternal Flow', artist: 'David Zhao', price: '2.1 ETH', category: 'Generative' },
    { id: 5, title: 'Urban Echoes', artist: 'Alex Morgan', price: '0.7 ETH', category: 'Street' },
    { id: 6, title: 'Digital Dreams', artist: 'Maya Patel', price: '1.5 ETH', category: 'Abstract' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Digital Art Marketplace
          </h1>
          <p className="text-gray-400 text-lg">
            Discover and collect unique digital artworks from talented artists worldwide
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
          {['All', 'Abstract', 'Digital', '3D', 'Generative'].map(filter => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-lg transition
                ${filter === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="card p-4 border border-gray-800 rounded-2xl hover:border-primary/50 transition group"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 group-hover:scale-105 transition-transform" />

              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{artwork.title}</h3>
                  <p className="text-gray-400 text-sm">by {artwork.artist}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                    {artwork.category}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">{artwork.price}</p>
                  <button className="mt-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Marketplace
