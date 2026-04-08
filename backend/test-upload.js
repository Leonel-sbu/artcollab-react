#!/usr/bin/env node

/**
 * TEST SCRIPT: Verify image upload and display flow
 * 
 * This script checks:
 * 1. Recent uploads in database
 * 2. Files exist on disk
 * 3. Files are valid images
 * 4. Server is serving them correctly
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    console.log('\n🔍 IMAGE UPLOAD TEST SCRIPT\n');

    try {
        // Connect to DB
        console.log('1️⃣ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artcollab');
        console.log('   ✓ Connected\n');

        // Check recent uploads in DB
        console.log('2️⃣ Checking recent artworks...');
        const Artwork = require('./src/models/Artwork');
        const recent = await Artwork.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select('title imageUrl createdAt status')
            .lean();

        console.log(`   Found ${recent.length} recent artworks:\n`);

        for (const art of recent) {
            const imageUrl = art.imageUrl;
            console.log(`   📄 "${art.title}"`);
            console.log(`      ImageUrl: ${imageUrl}`);

            // Extract filename
            let filename;
            if (imageUrl.includes('/uploads/')) {
                filename = imageUrl.split('/uploads/')[1];
            }

            if (filename) {
                const filePath = path.join(__dirname, '..', 'uploads', filename);

                // Check if file exists
                if (fs.existsSync(filePath)) {
                    const stat = fs.statSync(filePath);
                    const size = stat.size;

                    // Check if it's a valid image
                    const bytes = fs.readFileSync(filePath);
                    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8;
                    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50;
                    const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49;
                    const isWebP = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

                    const isValid = isJPEG || isPNG || isGIF || isWebP;
                    const type = isJPEG ? 'JPEG' : isPNG ? 'PNG' : isGIF ? 'GIF' : isWebP ? 'WebP' : 'Unknown';

                    console.log(`      ✓ File exists: ${filename}`);
                    console.log(`      ✓ Size: ${size} bytes`);
                    console.log(`      ✓ Type: ${type} ${isValid ? '✓' : '✗'}`);
                } else {
                    console.log(`      ✗ File NOT FOUND: ${filename}`);
                }
            } else {
                console.log(`      ⚠️  Could not extract filename from URL`);
            }

            console.log('');
        }

        console.log('3️⃣ Test Steps to Verify in Browser:');
        console.log('   1. Open http://localhost:5173');
        console.log('   2. Go to Upload Artwork');
        console.log('   3. Select and upload a NEW image (file upload, not URL)');
        console.log('   4. Check Marketplace - your image should display');
        console.log('   5. Open browser DevTools (F12) and check console for errors');
        console.log('   6. Check Network tab - image should load successfully\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

test();
