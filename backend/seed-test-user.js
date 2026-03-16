/**
 * ArtCollab Test User Seed Script
 * Run: node seed-test-user.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

async function seedTestUser() {
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
        const passwordHash = await bcrypt.hash('test123', salt);

        // Try to find existing user or create new
        const existingUser = await User.findOne({ email: 'test@artcollab.com' });

        if (existingUser) {
            // Update existing user password
            existingUser.passwordHash = passwordHash;
            existingUser.name = 'Test User';
            existingUser.role = 'buyer';
            await existingUser.save();
            console.log('\n✅ Test user updated!');
        } else {
            // Create new user
            const user = await User.create({
                name: 'Test User',
                email: 'test@artcollab.com',
                passwordHash,
                role: 'buyer'
            });
            console.log('\n✅ Test user created!');
        }

        console.log('   Email: test@artcollab.com');
        console.log('   Password: test123');
        console.log('   Role: buyer');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

seedTestUser();
