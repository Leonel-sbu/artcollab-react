/**
 * Migrate admin from users collection to admins collection
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Define schemas
        const userSchema = new mongoose.Schema({
            name: String, email: String, passwordHash: String, role: String
        }, { timestamps: true });

        const adminSchema = new mongoose.Schema({
            name: String, email: String, passwordHash: String, role: String
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', userSchema);
        const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

        // Find admin in users
        const adminUser = await User.findOne({ role: 'admin' });

        if (adminUser) {
            console.log('Found admin in users:', adminUser.email);

            // Create in admins collection
            await Admin.create({
                name: adminUser.name,
                email: adminUser.email,
                passwordHash: adminUser.passwordHash,
                role: 'admin'
            });

            // Delete from users
            await User.deleteOne({ _id: adminUser._id });
            console.log('Admin moved to admins collection');
        } else {
            console.log('No admin found in users collection');
        }

        // Show counts
        const userCount = await User.countDocuments();
        const adminCount = await Admin.countDocuments();

        console.log('Users count:', userCount);
        console.log('Admins count:', adminCount);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

migrate();
