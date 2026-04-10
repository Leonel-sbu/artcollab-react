const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Optional email sender (falls back to console.log)
let sendEmail = null;
try {
  const m = require("../utils/mailer");
  if (typeof m.sendEmail === "function") sendEmail = m.sendEmail;
} catch { }
try {
  const e = require("../utils/email");
  if (!sendEmail && typeof e.sendEmail === "function") sendEmail = e.sendEmail;
} catch { }

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret missing in env (JWT_SECRET)");
  if (secret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters for security");
  return jwt.sign({ id: userId }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

/**
 * Set auth cookie options based on environment
 */
function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    // 'none' required in production so the auth cookie is sent on cross-origin
    // requests (frontend on onrender.com subdomain → backend on different subdomain).
    // 'none' mandates secure:true (HTTPS), which is always true on Render/Vercel.
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

function safeUser(u) {
  return {
    _id:      u._id,
    name:     u.name,
    email:    u.email,
    role:     u.role,
    avatar:   u.avatar   || '',
    bio:      u.bio      || '',
    location: u.location || '',
  };
}

/**
 * Validate password meets production requirements
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
}

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "name, email, password are required" });
  }

  // Default registration role
  const validRoles = ['admin', 'artist', 'buyer', 'learner'];
  let userRole = 'artist';
  if (role !== undefined && role !== null) {
    const normalizedRole = String(role).trim().toLowerCase();
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    userRole = normalizedRole;
  }

  // Validate name is not empty/whitespace-only
  const trimmedName = name.trim();
  if (!trimmedName) {
    return res.status(400).json({ success: false, message: "Name cannot be empty or contain only whitespace" });
  }

  // Validate password meets minimum requirements
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const emailLower = email.toLowerCase().trim();

  // Check for existing user with email
  const exists = await User.findOne({ email: emailLower });
  if (exists) {
    return res.status(409).json({ success: false, message: "Email already in use" });
  }

  try {
    // Hash password inside try/catch so bcrypt failures are handled properly
    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: trimmedName,
      email: emailLower,
      passwordHash,
      role: userRole, // Always use buyer for public registration
    });

    const token = signToken(user._id);

    // Set token as httpOnly cookie
    res.cookie('auth_token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      token, // Keep for backward compatibility, but prefer cookie
      user: safeUser(user),
    });
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationMessages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: `Validation error: ${validationMessages}` });
    }
    // Handle duplicate key error (race condition)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    // Re-throw other errors to be caught by error handler
    throw err;
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "email and password are required" });
  }

  const emailLower = email.toLowerCase().trim();

  // First check Admin collection, then fall back to User collection
  let user = await Admin.findOne({ email: emailLower }).select("name email role passwordHash");
  let isAdminLogin = !!user;

  if (!user) {
    // Check regular users
    user = await User.findOne({ email: emailLower }).select("name email role passwordHash");
    // Also check if user has admin role in User collection
    if (user && user.role === 'admin') {
      isAdminLogin = true;
    }
  }

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = signToken(user._id);

  // Set token as httpOnly cookie
  res.cookie('auth_token', token, getCookieOptions());

  return res.json({
    success: true,
    token, // Keep for backward compatibility, but prefer cookie
    user: safeUser(user),
    isAdmin: isAdminLogin
  });
};

exports.me = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

/**
 * Logout - For JWT-based auth, this is a client-side operation
 * (token is stored locally and cleared on client)
 * 
 * In production with httpOnly cookies, this would:
 * 1. Clear the auth cookie
 * 2. Optionally blacklist the token in Redis
 */
exports.logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  return res.json({
    success: true,
    message: "Logged out successfully"
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "email is required" });

  const emailLower = email.toLowerCase().trim();
  const user = await User.findOne({ email: emailLower });

  // dont reveal existence
  if (!user) return res.json({ success: true, message: "If that email exists, a reset link was sent." });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15);
  await user.save({ validateBeforeSave: false });

  // Validate CLIENT_URL exists (must be configured for production)
  const client = process.env.CLIENT_URL;
  if (!client) {
    console.error('CLIENT_URL is not configured');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }
  // In production, reject localhost
  if (process.env.NODE_ENV === 'production' && (client.includes('localhost') || client.includes('127.0.0.1'))) {
    console.error('CLIENT_URL cannot be localhost in production');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }
  const resetUrl = `${client}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  const subject = "Reset your ArtCollab password";
  const text = `You requested a password reset.

Open this link to set a new password (valid for 15 minutes):
${resetUrl}

If you did not request this, you can ignore this email.`;

  if (sendEmail) {
    await sendEmail({ to: user.email, subject, text });
  } else {
    console.log("Password reset link (email not configured):", resetUrl);
  }

  return res.json({ success: true, message: "If that email exists, a reset link was sent." });
};

exports.resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({ success: false, message: "token, email, password are required" });
  }

  // Validate password meets complexity requirements
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ success: false, message: passwordErrors.join(", ") });
  }

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const emailLower = email.toLowerCase().trim();

  const user = await User.findOne({
    email: emailLower,
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select("name email role passwordHash resetPasswordToken resetPasswordExpires");

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
  }

  user.passwordHash = await User.hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  const jwtToken = signToken(user._id);

  // Set token as httpOnly cookie
  res.cookie('auth_token', jwtToken, getCookieOptions());

  return res.json({
    success: true,
    message: "Password reset successful.",
    token: jwtToken,
    user: safeUser(user),
  });
};
