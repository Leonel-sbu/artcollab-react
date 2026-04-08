/**
 * Seed Script - Populates database with test data
 * Run: node seed-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/artcollab';

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Import models
        const User = require('./src/models/User');
        const Course = require('./src/models/Course');
        const Artwork = require('./src/models/Artwork');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Course.deleteMany({});
        await Artwork.deleteMany({});

        // Hash password
        const hashedPassword = await bcrypt.hash('password', 10);

        // Create test users
        console.log('Creating users...');
        const users = await User.insertMany([
            {
                name: 'John Doe',
                email: 'john@example.com',
                passwordHash: hashedPassword,
                role: 'artist',
                bio: 'Professional digital artist',
                avatar: 'https://via.placeholder.com/150'
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                passwordHash: hashedPassword,
                role: 'buyer',
                bio: 'Art collector',
                avatar: 'https://via.placeholder.com/150'
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                passwordHash: hashedPassword,
                role: 'admin',
                bio: 'Platform administrator'
            }
        ]);
        console.log('Created ' + users.length + ' users');

        // Create courses (matching Course schema)
        console.log('Creating courses...');
        const courses = await Course.insertMany([
            {
                title: 'Digital Painting Fundamentals',
                description: 'Master digital painting techniques from scratch. Learn color theory, brush techniques, and create stunning artwork.',
                shortDescription: 'Master digital painting techniques',
                thumbnailUrl: 'https://via.placeholder.com/400x225',
                instructor: users[0]._id,
                pricing: {
                    oneTime: { enabled: true, price: 499, currency: 'ZAR' },
                    monthly: { enabled: false, price: 0 },
                    yearly: { enabled: false, price: 0 }
                },
                category: 'art',
                difficulty: 'beginner',
                tags: ['digital', 'painting', 'art'],
                lessons: [
                    { title: 'Introduction to Digital Art', description: 'Getting started with digital tools', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', durationSec: 1800, order: 1 },
                    { title: 'Color Theory Basics', description: 'Understanding colors', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', durationSec: 2400, order: 2 },
                    { title: 'Brush Techniques', description: 'Mastering brushes', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', durationSec: 3600, order: 3 }
                ],
                enrollmentCount: 0,
                status: 'published',
                learningOutcomes: ['Master digital painting', 'Understand color theory', 'Create artwork']
            },
            {
                title: '3D Modeling for Beginners',
                description: 'Learn 3D modeling from scratch using modern tools. Perfect for beginners who want to create 3D art.',
                shortDescription: 'Learn 3D modeling from scratch',
                thumbnailUrl: 'https://via.placeholder.com/400x225',
                instructor: users[0]._id,
                pricing: {
                    oneTime: { enabled: true, price: 799, currency: 'ZAR' },
                    monthly: { enabled: false, price: 0 },
                    yearly: { enabled: false, price: 0 }
                },
                category: '3d',
                difficulty: 'beginner',
                tags: ['3d', 'modeling', 'blender'],
                lessons: [
                    { title: 'Getting Started with 3D', description: 'Introduction to 3D space', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', durationSec: 1800, order: 1 },
                    { title: 'Basic Shapes', description: 'Creating primitives', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', durationSec: 2400, order: 2 }
                ],
                enrollmentCount: 0,
                status: 'published',
                learningOutcomes: ['Create 3D models', 'Use modeling software', 'Build scenes']
            },
            {
                title: 'AI Art Masterclass',
                description: 'Create stunning AI artwork with modern tools. Learn prompt engineering and AI art techniques.',
                shortDescription: 'Create stunning AI artwork',
                thumbnailUrl: 'https://via.placeholder.com/400x225',
                instructor: users[0]._id,
                pricing: {
                    oneTime: { enabled: true, price: 399, currency: 'ZAR' },
                    monthly: { enabled: true, price: 99, currency: 'ZAR' },
                    yearly: { enabled: false, price: 0 }
                },
                category: 'art',
                difficulty: 'intermediate',
                tags: ['AI', 'art', 'midjourney', 'stable diffusion'],
                lessons: [
                    { title: 'AI Art Tools Overview', description: 'Overview of available tools', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', durationSec: 1800, order: 1 },
                    { title: 'Prompts Mastery', description: 'Writing effective prompts', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', durationSec: 2400, order: 2 }
                ],
                enrollmentCount: 0,
                status: 'published',
                learningOutcomes: ['Use AI art tools', 'Write better prompts', 'Create AI artwork']
            }
        ]);
        console.log('Created ' + courses.length + ' courses');

        // Create artworks
        console.log('Creating artworks...');
        const artworks = await Artwork.insertMany([
            {
                title: 'Sunset Dreams',
                description: 'A beautiful sunset over the mountains',
                price: 250,
                category: 'landscape',
                medium: 'digital',
                artist: users[0]._id,
                status: 'published',
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                title: 'Abstract Fusion',
                description: 'Modern abstract art piece',
                price: 400,
                category: 'abstract',
                medium: 'digital',
                artist: users[0]._id,
                status: 'published',
                imageUrl: 'https://via.placeholder.com/400x300'
            },
            {
                title: 'Character Design',
                description: 'Original character illustration',
                price: 150,
                category: 'illustration',
                medium: 'digital',
                artist: users[0]._id,
                status: 'published',
                imageUrl: 'https://via.placeholder.com/400x300'
            }
        ]);
        console.log('Created ' + artworks.length + ' artworks');

        console.log('\n===========================================');
        console.log('   DATABASE SEEDED SUCCESSFULLY!');
        console.log('===========================================');
        console.log('\nTest Accounts:');
        console.log('  Email: john@example.com | Role: artist | Password: password');
        console.log('  Email: jane@example.com | Role: buyer  | Password: password');
        console.log('  Email: admin@example.com | Role: admin  | Password: password');

    } catch (error) {
        console.error('Seeding failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    }
}

seed();
