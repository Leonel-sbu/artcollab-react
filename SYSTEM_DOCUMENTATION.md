# ArtColLab - Complete System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Features & Modules](#features--modules)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

**ArtColLab** is a full-stack digital art marketplace built with the MERN stack (MongoDB, Express, React, Node.js).

### What Can You Do?

#### For Artists:
- 📤 Upload and sell digital artwork
- 💰 Set custom pricing in ZAR (South African Rand)
- 🎨 Accept commission requests from buyers
- 📚 Create and sell courses
- 💬 Message buyers directly

#### For Buyers:
- 🖼️ Browse and purchase artwork
- 📚 Enroll in art courses
- ⭐ Leave reviews and ratings
- 🛒 Manage shopping cart
- 💬 Contact artists directly

#### For Admins:
- 👥 Manage users and content
- 📊 View platform analytics
- ⚠️ Moderate reported content
- 🛡️ Full platform control

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Quick Start

#### 1. Start Backend
```bash
cd backend
npm install
node src/server.js
```
- Server runs on: http://localhost:5000

#### 2. Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs on: http://localhost:5173

#### 3. Login Credentials
- **Email:** nela300@gmail.com
- **Password:** Nela3000!

---

## User Roles

| Role | Description | Access |
|------|-------------|--------|
| `buyer` | Default user | Browse, purchase, message |
| `artist` | Content creator | + Upload art, create courses |
| `learner` | Course student | + Enroll in courses |
| `admin` | Platform admin | Full access |

---

## Features & Modules

### 1. Authentication System
- **Register:** Create account with name, email, password
- **Login:** Email/password with JWT token
- **Logout:** Clear session
- **Password:** Reset via email

**Security Features:**
- httpOnly cookies (XSS protected)
- CSRF token protection
- Rate limiting
- Password requirements (8+ chars, uppercase, lowercase, number, special char)

### 2. Marketplace (Artwork)
- Browse artwork by category
- Filter by: category, price, popularity
- Search by title/description
- Shopping cart
- Purchase via Stripe

**Categories:**
- Abstract, Digital, 3D, Generative, Illustration, Photography, Animation, Street

### 3. Learning Platform
- Browse courses
- Enroll in courses
- Track progress
- Submit assignments
- Earn points & level up

**Navigation Tabs:**
1. **Discover** - Browse all courses
2. **My Learning** - Enrolled courses
3. **Teach** - Create courses & earn
4. **Progress** - Points & levels

### 4. Messaging System
- Direct messages between users
- Conversation threads
- Unread message count
- Real-time notifications

### 5. Commissions
- Request custom artwork
- Set budget and requirements
- Artist approval workflow
- Category-based filtering

### 6. Reviews & Ratings
- Rate purchased artwork
- Write reviews
- View ratings on artwork

### 7. Admin Dashboard
- User management
- Content moderation
- Platform statistics
- Order management

---

## API Endpoints

### Authentication
```
POST   /api/auth/register     - Create account
POST   /api/auth/login        - Login
POST   /api/auth/logout       - Logout
GET    /api/auth/me           - Get current user
POST   /api/auth/forgot-password - Request reset
POST   /api/auth/reset-password  - Reset password
```

### Artwork
```
GET    /api/artworks          - List artworks (with filters)
POST   /api/artworks          - Upload artwork
GET    /api/artworks/:id      - Get artwork
PUT    /api/artworks/:id      - Update artwork
DELETE /api/artworks/:id      - Delete artwork
```

### Cart & Orders
```
GET    /api/cart              - Get cart
POST   /api/cart/add          - Add item
DELETE /api/cart/:itemId      - Remove item
POST   /api/orders            - Create order
GET    /api/orders            - List orders
```

### Courses
```
GET    /api/courses           - List courses
GET    /api/courses/:id       - Get course
POST   /api/courses           - Create course
POST   /api/courses/enroll    - Enroll in course
GET    /api/courses/my        - My enrollments
GET    /api/courses/stats     - Course stats
```

### Messages
```
GET    /api/messages/conversations - List conversations
GET    /api/messages/:conversationId - Get messages
POST   /api/messages           - Send message
GET    /api/messages/unread-count   - Unread count
```

### Commissions
```
GET    /api/commissions       - List commissions
POST   /api/commissions       - Create request
PUT    /api/commissions/:id   - Update status
```

### Reviews
```
GET    /api/reviews/artwork/:id - Get artwork reviews
POST   /api/reviews          - Create review
```

---

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: Enum['admin','artist','buyer','learner'],
  avatar: String,
  bio: String,
  createdAt: Date
}
```

### Artwork
```javascript
{
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  price: Number,
  artist: ObjectId (User),
  status: Enum['pending','approved','rejected'],
  tags: [String],
  createdAt: Date
}
```

### Course
```javascript
{
  title: String,
  description: String,
  category: String,
  difficulty: String,
  instructor: ObjectId (User),
  pricing: {
    oneTime: { enabled: Boolean, price: Number },
    monthly: { enabled: Boolean, price: Number },
    yearly: { enabled: Boolean, price: Number }
  },
  lessons: [{
    title: String,
    videoUrl: String,
    durationSec: Number
  }],
  enrollmentCount: Number,
  createdAt: Date
}
```

### Enrollment
```javascript
{
  user: ObjectId (User),
  course: ObjectId (Course),
  progressPercent: Number,
  completedLessons: [Number],
  enrolledAt: Date
}
```

### Order
```javascript
{
  user: ObjectId (User),
  items: [{
    item: ObjectId,
    kind: String,
    price: Number
  }],
  total: Number,
  status: Enum['pending','paid','shipped','delivered'],
  createdAt: Date
}
```

### Message
```javascript
{
  conversation: ObjectId,
  sender: ObjectId (User),
  content: String,
  read: Boolean,
  createdAt: Date
}
```

---

## Troubleshooting

### Common Issues

#### 1. Login Returns 401
**Cause:** User doesn't exist or password wrong
**Solution:** 
- Check email is correct
- Password requires: 8+ chars, uppercase, lowercase, number, special char
- Try: Nela3000!

#### 2. Network Error
**Cause:** Frontend can't reach backend
**Solution:**
- Ensure backend runs on port 5000
- Ensure frontend runs on port 5173
- Both must be running simultaneously

#### 3. MongoDB Connection Failed
**Solution:**
- Check MongoDB is running
- Verify MONGO_URI in .env

#### 4. Images Not Loading
**Solution:**
- Check uploads folder exists
- Verify file permissions

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
node src/server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Then open http://localhost:5173 in browser.

---

## Quick Reference

| Item | Value |
|------|-------|
| Backend URL | http://localhost:5000 |
| Frontend URL | http://localhost:5173 |
| Database | MongoDB |
| Payment | Stripe |
| Auth | JWT (httpOnly cookies) |

---

*Documentation Version: 1.0*
*Last Updated: 2026-03-25*
