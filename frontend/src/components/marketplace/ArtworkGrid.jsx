// src/components/marketplace/ArtworkGrid.jsx
import { motion } from 'framer-motion';
import ArtworkCard from './ArtworkCard';

const ArtworkGrid = ({ viewMode, category }) => {
    const artworks = [
        {
            id: 1,
            title: "Digital Dreams",
            artist: "Sarah Chen",
            price: "1.5 ETH",
            likes: 234,
            image: "/images/artwork-1.jpg",
            category: "digital"
        },
        {
            id: 2,
            title: "Abstract Universe",
            artist: "Alex Rivera",
            price: "2.3 ETH",
            likes: 189,
            image: "/images/artwork-2.jpg",
            category: "abstract"
        },
        {
            id: 3,
            title: "AI Genesis",
            artist: "Maya Patel",
            price: "3.7 ETH",
            likes: 456,
            image: "/images/artwork-3.jpg",
            category: "generative"
        },
        {
            id: 4,
            title: "3D Sculpture",
            artist: "Michael Torres",
            price: "1.8 ETH",
            likes: 123,
            image: "/images/artwork-4.jpg",
            category: "3d"
        },
        {
            id: 5,
            title: "Neon Dreams",
            artist: "Emma Wilson",
            price: "0.9 ETH",
            likes: 321,
            image: "/images/artwork-5.jpg",
            category: "digital"
        },
        {
            id: 6,
            title: "Cosmic Energy",
            artist: "Jordan Lee",
            price: "2.5 ETH",
            likes: 278,
            image: "/images/artwork-6.jpg",
            category: "abstract"
        }
    ];

    const filteredArtworks = category === 'all'
        ? artworks
        : artworks.filter(art => art.category === category);

    return (
        <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
            {filteredArtworks.map((artwork, index) => (
                <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <ArtworkCard
                        artwork={artwork}
                        viewMode={viewMode}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default ArtworkGrid;