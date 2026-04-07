# ArtColLab System Status Report

**Generated:** March 27, 2026

---

## 1. PROJECT OVERVIEW

**Project Name:** ArtColLab  
**Type:** Full-Stack MERN Web Application  
**Description:** Virtual reality art gallery, marketplace, and community platform

---

## 2. SYSTEM ARCHITECTURE

### Frontend Stack
| Component | Version |
|-----------|---------|
| React | 18.3.1 |
| Vite | 7.3.1 |
| Tailwind CSS | 3.4.14 |
| Framer Motion | 12.26.2 |
| React Router DOM | 6.26.2 |
| Axios | 1.13.4 |
| Lucide React | 0.562.0 |
| Stripe React | 5.6.0 |

### Backend Stack
| Component | Version |
|-----------|---------|
| Node.js | Latest |
| Express.js | 4.21.0 |
| MongoDB (Mongoose) | 8.21.0 |
| JSON WebToken | 9.0.3 |
| Bcryptjs | 2.4.3 |
| Stripe | 14.25.0 |
| Helmet | 7.2.0 |
| Express Rate Limit | 8.3.1 |

---

## 3. DATABASE CONFIGURATION

### MongoDB Atlas
| Setting | Value |
|---------|-------|
| Connection String | `mongodb+srv://leonelndhlovu313_db_user:***@artcollab.puiqlvh.mongodb.net/?appName=ArtCollab` |
| Database Name | artcollab |
| Cluster | artcollab.puiqlvh.mongodb.net |
| IP Whitelist | 0.0.0.0/0 (All IPs) |
| Status | ✅ Connected |

### Connection Strategy
The backend uses multiple connection strategies with fallback:
1. Standard connection with retryWrites & retryReads
2. Direct connection to primary
3. TLS disabled fallback

---

## 4. SERVER CONFIGURATION

### Backend Server
| Setting | Value |
|---------|-------|
| Port | 5000 |
| Environment | development |
| Health Check | `/api/health` |
| Uploads Endpoint | `/uploads` |

### Frontend Server
| Setting | Value |
|---------|-------|
| Port | 5173 |
| Build Output | dist/ |
| Proxy Target | http://localhost:5000 |

---

## 5. API ENDPOINTS

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Artworks
- `GET /api/artworks` - List artworks
- `POST /api/artworks` - Create artwork
- `GET /api/artworks/:id` - Get artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course

### Cart & Orders
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart
- `POST /api/orders` - Create order

### Messaging
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/unread-count` - Unread count

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Admin
- `GET /api/admin/*` - Admin routes
- `POST /api/admin/*` - Admin actions

### Payments
- `POST /api/payments/webhook` - Stripe webhook
- `POST /api/payments/create-checkout-session` - Create checkout

### Community
- `GET /api/community/posts` - Community posts
- `POST /api/community/posts` - Create post

### Reviews & Reports
- `GET /api/reviews` - Reviews
- `POST /api/reviews` - Create review
- `POST /api/reports` - Submit report

### Notifications
- `GET /api/notifications` - Get notifications

---

## 6. SECURITY CONFIGURATIONS

### CORS
- Development: Allows localhost:5173, localhost:5174, 127.0.0.1:5173, 127.0.0.1:5174
- Production: Only configured CLIENT_URL
- Credentials: Enabled

### Authentication
- JWT tokens stored in httpOnly cookies
- CSRF protection enabled
- Rate limiting: 100 requests per 15 minutes

### Security Headers (Helmet)
- Content Security Policy
- Cross-Origin Resource Policy
- XSS protection via input sanitization

---

## 7. INTEGRATIONS

### Stripe
| Setting | Value |
|---------|-------|
| Secret Key | sk_test_*** |
| Webhook Secret | whsec_*** |

### Email (SendGrid)
| Setting | Value |
|---------|-------|
| SMTP Host | smtp.sendgrid.net |
| SMTP Port | 587 |
| From | leonelndhlovu69@gmail.com |

---

## 8. PROJECT STRUCTURE

```
artcollab-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, cloud storage, Stripe config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, CSRF, rate limiting
│   │   ├── models/          # Mongoose models (17 models)
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utilities
│   │   ├── app.js          # Express app
│   │   └── server.js       # Server entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── courses/
│   │   │   ├── marketplace/
│   │   │   ├── messaging/
│   │   │   ├── moderation/
│   │   │   ├── payment/
│   │   │   ├── reviews/
│   │   │   └── shared/
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── assets/        # Images, fonts
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
└── docs/                   # Documentation
```

---

## 9. STARTUP COMMANDS

### Development
```bash
# Terminal 1 - Backend
cd backend
node src/server.js
# or with nodemon
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend (with PM2)
cd backend
pm2 start ecosystem.config.js
```

---

## 10. SYSTEM STATUS

| Component | Status |
|-----------|--------|
| MongoDB Atlas | ✅ Connected |
| Backend Server | ✅ Running (Port 5000) |
| Frontend Server | ✅ Running (Port 5173) |
| CORS | ✅ Configured |
| JWT Auth | ✅ Working |
| Stripe Integration | ✅ Configured |
| Email (SendGrid) | ✅ Configured |

---

## 11. RECENT FIXES APPLIED

1. ✅ MongoDB Atlas connection with multiple fallback strategies
2. ✅ CORS configuration for localhost:5173
3. ✅ JWT authentication with httpOnly cookies
4. ✅ CSRF protection middleware
5. ✅ Rate limiting (100 req/15min)
6. ✅ Input sanitization (XSS prevention)
7. ✅ Health check endpoint
8. ✅ Graceful shutdown handling
9. ✅ Premium scroll indicator on Home page
10. ✅ Framer-motion scroll reveal animations
11. ✅ Smooth scrolling CSS
12. ✅ Image path fixes

---

## 12. KNOWN ISSUES

- None currently identified

---

## END OF REPORT
