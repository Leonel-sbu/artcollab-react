/**
 * ArtCollab Artist User Seed Script
 * Run: node seed-artist-user.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

async function seedArtistUser() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const userSchema = new mongoose.Schema({
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, unique: true, lowercase: true, trim: true },
            passwordHash: { type: String, required: true },
            role: { type: String, enum: ['admin', 'artist', 'buyer', 'learner'], default: 'buyer' }
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('artist123', salt);

        // Try to find existing user or create new
        const existingUser = await User.findOne({ email: 'artist@artcollab.com' });

        if (existingUser) {
            // Update existing user
            existingUser.passwordHash = passwordHash;
            existingUser.name = 'Artist User';
            existingUser.role = 'artist';
            await existingUser.save();
            console.log('\n✅ Artist user updated!');
        } else {
            // Create new user
            const user = await User.create({
                name: 'Artist User',
                email: 'artist@artcollab.com',
                passwordHash,
                role: 'artist'
            });
            console.log('\n✅ Artist user created!');
        }

        console.log('   Email: artist@artcollab.com');
        console.log('   Password: artist123');
        console.log('   Role: artist');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

seedArtistUser();
