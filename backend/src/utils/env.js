/**
 * Environment Variable Validation for Production
 * Validates required environment variables and their values
 */

const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'STRIPE_SECRET_KEY'
];

const isProduction = process.env.NODE_ENV === 'production';

// Check for missing required variables
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing required environment variable: ${k}`);
    process.exit(1);
  }
}

// Validate JWT_SECRET length for production security
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters for production security');
  if (isProduction) {
    process.exit(1);
  } else {
    console.warn('WARNING: JWT_SECRET is too short. This will fail in production.');
  }
}

// Validate CLIENT_URL is HTTPS in production
if (process.env.CLIENT_URL) {
  if (isProduction && !process.env.CLIENT_URL.startsWith('https://')) {
    console.error('CLIENT_URL must use HTTPS in production');
    process.exit(1);
  }
} else if (isProduction) {
  console.error('CLIENT_URL is required in production');
  process.exit(1);
}

// Validate MongoDB URI format
if (process.env.MONGO_URI) {
  if (!process.env.MONGO_URI.startsWith('mongodb') && !process.env.MONGO_URI.startsWith('mongodb+srv')) {
    console.error('MONGO_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)');
    process.exit(1);
  }
}

// Warn about Stripe webhook secret in production
if (isProduction && !process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('WARNING: STRIPE_WEBHOOK_SECRET is not set. Stripe webhooks will not work.');
}

// Validate Stripe keys format in production
if (isProduction && process.env.STRIPE_SECRET_KEY) {
  if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.error('STRIPE_SECRET_KEY must be a live key (sk_live_...) for production');
    process.exit(1);
  }
}

// Warn about missing email configuration
if (!process.env.SENDGRID_API_KEY && isProduction) {
  console.warn('WARNING: SENDGRID_API_KEY not set. Password reset and email notifications will not work.');
}

// Production-specific checks
if (isProduction) {
  // Check for development/localhost values that shouldn't be in production
  if (process.env.CLIENT_URL?.includes('localhost') || process.env.CLIENT_URL?.includes('127.0.0.1')) {
    console.error('CLIENT_URL cannot contain localhost in production');
    process.exit(1);
  }

  if (process.env.MONGO_URI?.includes('localhost') || process.env.MONGO_URI?.includes('127.0.0.1')) {
    console.error('MONGO_URI cannot contain localhost in production - use MongoDB Atlas');
    process.exit(1);
  }

  console.log('✓ Production environment validation passed');
} else {
  console.log('Running in development mode');
}

module.exports = {};
