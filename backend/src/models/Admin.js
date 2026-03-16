/**
 * Admin Model - Separate collection for admin users
 * This keeps admin users separate from regular website users
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, default: 'admin' },
        isSuperAdmin: { type: Boolean, default: false },
        permissions: [{
            type: String,
            enum: ['users', 'artworks', 'courses', 'orders', 'commissions', 'settings']
        }]
    },
    { timestamps: true }
);

adminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

adminSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('Admin', adminSchema);
