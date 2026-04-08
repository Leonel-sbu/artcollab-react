const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artcollab');
        const Artwork = require('./src/models/Artwork');

        const recent = await Artwork.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title imageUrl createdAt')
            .lean();

        console.log('\n=== RECENT ARTWORKS IMAGE URLS ===\n');
        recent.forEach((art, idx) => {
            console.log(`${idx + 1}. "${art.title}"`);
            console.log(`   ImageUrl: ${art.imageUrl}`);
            console.log(`   Created: ${new Date(art.createdAt).toLocaleString()}`);
            console.log('');
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

connectDB();
