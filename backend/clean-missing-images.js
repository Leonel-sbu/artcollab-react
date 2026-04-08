// Script to clean up artworks with missing image files
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const uploadsDir = path.join(__dirname, 'uploads');

async function cleanMissingImages() {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/artcollab';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Define Artwork schema inline
    const artworkSchema = new mongoose.Schema({
        title: String,
        description: String,
        category: String,
        tags: [String],
        price: Number,
        currency: String,
        imageUrl: String,
        royalty: Number,
        licenseType: String,
        isExclusive: Boolean,
        artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, default: 'published' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }, { timestamps: true });

    const Artwork = mongoose.model('Artwork', artworkSchema);

    // Get all artworks
    const artworks = await Artwork.find({});
    console.log(`Found ${artworks.length} artworks in database`);

    let deletedCount = 0;
    let keptCount = 0;

    for (const artwork of artworks) {
        const imageUrl = artwork.imageUrl;

        // Skip external URLs
        if (!imageUrl || imageUrl.startsWith('http')) {
            console.log(`  ✓ Keeping (external URL): ${artwork.title}`);
            keptCount++;
            continue;
        }

        // Extract filename from path
        const filename = path.basename(imageUrl);
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            console.log(`  ✓ Keeping (file exists): ${artwork.title} - ${filename}`);
            keptCount++;
        } else {
            console.log(`  ✗ Deleting (file missing): ${artwork.title} - ${filename}`);
            await Artwork.findByIdAndDelete(artwork._id);
            deletedCount++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total artworks: ${artworks.length}`);
    console.log(`Kept: ${keptCount}`);
    console.log(`Deleted: ${deletedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
}

cleanMissingImages().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
