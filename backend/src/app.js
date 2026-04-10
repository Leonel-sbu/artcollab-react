require("dotenv").config();
require("express-async-errors");
require("./utils/env");

/* ------------------------------- MODELS ---------------------------------- */
// Register all models before any route/controller is loaded
require("./models/User");
require("./models/Admin");
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
require("./models/VRVideo");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const { sanitizeObject } = require("./middleware/sanitizeInput");

/* --------------------------- UPLOAD DIRECTORIES -------------------------- */
// Guarantee these exist on every startup (critical for multer)
["uploads", "uploads/posts", "uploads/services", "uploads/courses", "uploads/avatars", "uploads/messages"].forEach(
  (dir) => fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true })
);

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
const userRoutes = require("./routes/userRoutes");
const vrVideoRoutes = require("./routes/vrVideoRoutes");

const app = express();

/* ─────────────────────── PROCESS-LEVEL SAFETY NET ───────────────────── */
// Prevent a stray unhandledRejection from killing the server mid-request.
// express-async-errors handles errors inside route handlers, but background
// promises (event emitters, fire-and-forget) can still escape.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

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
          process.env.CLIENT_URL || "",
        ],
      },
    },
  })
);

/* ------------------------------- CORS ------------------------------------ */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [];

    if (process.env.CLIENT_URL) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }

    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.push(
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
      );
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));

/* ---------------------------- RATE LIMITING ------------------------------- */
const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

/* ─────────────────────── COOKIE PARSER ───────────────────────────────── */
app.use(cookieParser());

/* ─────────────────────── STRIPE WEBHOOK ──────────────────────────────── */
// CRITICAL: must be registered BEFORE express.json() so the body is still
// the raw Buffer that Stripe needs for signature verification.
// Once express.json() runs, the raw body is consumed and unavailable.
const stripeWebhookController = require("./controllers/stripeWebhookController");
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController.webhook
);

/* ─────────────────────── BODY PARSING ────────────────────────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* --------------------------- HTTPS REDIRECT ------------------------------- */
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
    }
    next();
  });
}

/* --------------------------- INPUT SANITIZATION --------------------------- */
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

/* --------------------------- CSRF PROTECTION ------------------------------ */
const csrfMiddleware = require("./middleware/csrfMiddleware");

// Public token endpoint — exempt from CSRF, issues fresh secret+token
app.get("/api/csrf-token", csrfMiddleware.getCsrfToken);

// Global CSRF enforcement (GET/HEAD/OPTIONS pass through; see csrfMiddleware.js)
app.use(csrfMiddleware);

/* ------------------------------ LOGGING ---------------------------------- */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* --------------------------- STATIC FILES -------------------------------- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ------------------------------- HEALTH ---------------------------------- */
app.get("/api/health", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const dbState = mongoose.connection.readyState;
    const isHealthy = dbState === 1;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? "ok" : "degraded",
      database: isHealthy ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
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
app.use("/api/users", userRoutes);
app.use("/api/vr-videos", vrVideoRoutes);

/* --------------------------- ERROR HANDLING ------------------------------ */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
