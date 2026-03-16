/**
 * ArtCollab Admin Seed Script
 * 
 * This script creates the first admin user securely.
 * Run once: node seed-admin.js
 * 
 * SECURITY: After running, delete this file or move it outside the project!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artcollab';

// Admin credentials - CHANGE THESE before running!
const ADMIN_EMAIL = 'test@example.com';
const ADMIN_PASSWORD = 'admin123';  // Simple password for testing
const ADMIN_NAME = 'Test Admin';

async function seedAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Define User schema inline to avoid import issues
        const userSchema = new mongoose.Schema({
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, unique: true, lowercase: true, trim: true },
            passwordHash: { type: String, required: true },
            role: { type: String, enum: ['admin', 'artist', 'buyer', 'learner'], default: 'buyer' }
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Force delete existing admin for testing
        await User.deleteMany({ role: 'admin' });
        console.log('Deleted existing admin users');

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create admin user
        const admin = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL.toLowerCase(),
            passwordHash,
            role: 'admin'
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('   Email: ' + admin.email);
        console.log('   Name: ' + admin.name);
        console.log('   Role: ' + admin.role);
        console.log('\n📝 Next steps:');
        console.log('   1. Login at /admin/login with your credentials');
        console.log('   2. Change this password immediately after first login');
        console.log('   3. Delete this seed script for security!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating admin: ' + error.message);
        process.exit(1);
    }
}

// Run the seed
seedAdmin();
