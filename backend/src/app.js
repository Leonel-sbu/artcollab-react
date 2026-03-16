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
const { sanitizeBody } = require("./middleware/sanitizeInput");

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
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

/* ----------------------------- BODY PARSING ------------------------------ */
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* --------------------------- INPUT SANITIZATION --------------------------- */
// Sanitize all request body inputs to prevent XSS
// TEMPORARILY DISABLED - causing issues with JSON parsing
// app.use(sanitizeBody);

/* --------------------------- CSRF PROTECTION ------------------------------ */
// Custom CSRF middleware with route exemptions
const csrfMiddleware = require('./middleware/csrfMiddleware');

// Public endpoint to get CSRF token - must be before routes that need protection
app.get('/api/csrf-token', csrfMiddleware.csrfProtection, (req, res) => {
  // Token is automatically set in cookie by csurf
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all other routes (excludes webhook, health, csrf-token)
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
