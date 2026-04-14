
require("dotenv").config();
require("express-async-errors");
require("./utils/env");

/* ------------------------------- MODELS ---------------------------------- */
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

/* --------------------------- CREATE APP ---------------------------------- */
const app = express();

/* ─────────────────────── PROCESS SAFETY ───────────────────── */
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

/* --------------------------- UPLOAD DIRS --------------------------------- */
["uploads", "uploads/posts", "uploads/services", "uploads/courses", "uploads/avatars", "uploads/messages"].forEach(
  (dir) => fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true })
);

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
};

app.use(cors(corsOptions));

/* ---------------------------- RATE LIMIT --------------------------------- */
const rateLimit = require("express-rate-limit");

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 100 : 1000,
    message: { success: false, message: "Too many requests. Try again later." },
  })
);

/* ---------------------------- MIDDLEWARE --------------------------------- */
app.use(cookieParser());

/* ------------------------ STRIPE WEBHOOK (RAW) --------------------------- */
const stripeWebhookController = require("./controllers/stripeWebhookController");

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController.webhook
);

/* ---------------------------- BODY PARSER -------------------------------- */
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

/* ------------------------ INPUT SANITIZATION ------------------------------ */
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    req.body = sanitizeObject(req.body);
  }
  next();
});

/* ---------------------------- CSRF --------------------------------------- */
const csrfMiddleware = require("./middleware/csrfMiddleware");

app.get("/api/csrf-token", csrfMiddleware.getCsrfToken);
app.use(csrfMiddleware);

/* ----------------------------- LOGGING ----------------------------------- */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ---------------------------- STATIC FILES ------------------------------- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ------------------------------- HEALTH ---------------------------------- */
app.get("/api/health", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const isHealthy = mongoose.connection.readyState === 1;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? "ok" : "degraded",
    });
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/* ------------------------------- ROOT FIX -------------------------------- */
// ✅ THIS FIXES YOUR RENDER ERROR
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ArtCollab API is running 🚀",
  });
});

app.head("/", (req, res) => {
  res.sendStatus(200);
});

/* ------------------------------- ROUTES ---------------------------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/artworks", require("./routes/artworkRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/community", require("./routes/communityRoutes"));
app.use("/api/commissions", require("./routes/commissionRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/stripeRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/vr-videos", require("./routes/vrVideoRoutes"));

/* --------------------------- ERROR HANDLING ------------------------------ */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
