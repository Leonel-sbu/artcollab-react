require("dotenv").config();
require("express-async-errors");
require("./utils/env");

/* ------------------------------- MODELS ---------------------------------- */
// Import all models to register them with Mongoose
require("./models/User");
require("./models/Artwork");
require("./models/CommunityPost");
require("./models/Notification");
require("./models/Order");
require("./models/Cart");
require("./models/Commission");
require("./models/Course");
require("./models/Enrollment");
require("./models/Message");
require("./models/Post");
require("./models/Report");
require("./models/Review");
require("./models/Conversation");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const { sanitizeBody, sanitizeObject } = require("./middleware/sanitizeInput");

/* ------------------------------- ROUTES ---------------------------------- */
const authRoutes = require("./routes/authRoutes");
const artworkRoutes = require("./routes/artworkRoutes");
const courseRoutes = require("./routes/courseRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const communityRoutes = require("./routes/communityRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

/* ----------------------------- SECURITY ---------------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "http://localhost:5000",
          process.env.CLIENT_URL || ""
        ],
      },
    },
  })
);

/* ------------------------------- CORS ------------------------------------ */
// Production-safe CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // In production, only allow the configured CLIENT_URL
    const allowedOrigins = [];

    // Always allow the configured CLIENT_URL
    if (process.env.CLIENT_URL) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }

    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push('http://localhost:5173');
      allowedOrigins.push('http://localhost:5174');
      allowedOrigins.push('http://127.0.0.1:5173');
      allowedOrigins.push('http://127.0.0.1:5174');
    }

    // Check if origin is in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token', 'X-Requested-With']
};

app.use(cors(corsOptions));

/* ---------------------------- RATE LIMITING ------------------------------- */
const rateLimit = require('express-rate-limit');

// Global rate limiter - applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: false
});

// Apply global rate limiter
app.use(globalLimiter);

/* ----------------------------- BODY PARSING ------------------------------ */
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* --------------------------- HTTPS REDIRECT ------------------------------- */
// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

/* --------------------------- INPUT SANITIZATION --------------------------- */
// Sanitize all request body inputs to prevent XSS
// Applied after express.json to avoid parsing issues

// Sanitize body - skip if body is not a plain object (e.g., Stripe webhook raw body)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

/* --------------------------- CSRF PROTECTION ------------------------------ */
// Custom CSRF middleware with route exemptions
const csrfMiddleware = require('./middleware/csrfMiddleware');

// Public endpoint to get CSRF token
app.get('/api/csrf-token', csrfMiddleware.getCsrfToken);

// Apply CSRF middleware to all other routes (excludes webhook, health, csrf-token)
// CSRF token is generated automatically for GET requests
// For POST/PUT/DELETE, use verifyCsrf middleware in specific routes
app.use(csrfMiddleware);

/* ------------------------------ LOGGING ---------------------------------- */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* --------------------------- STATIC FILES -------------------------------- */
/*
  IMPORTANT:
  Using process.cwd() ensures it always serves from backend root,
  regardless of where this file lives.
*/
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

/* --------------------------- STRIPE WEBHOOK -------------------------------- */
// Webhook MUST come before express.json() - requires raw body for signature verification
const stripeWebhookController = require("./controllers/stripeWebhookController");
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhookController.webhook);

/* ------------------------------- HEALTH ---------------------------------- */
app.get("/api/health", async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;

    const checks = {
      database: dbState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };

    const isHealthy = dbState === 1;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? 'ok' : 'degraded',
      ...checks
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/* ------------------------------- API ROUTES ------------------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", stripeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);

/* --------------------------- ERROR HANDLING ------------------------------ */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
