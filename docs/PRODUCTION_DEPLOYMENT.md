# ArtColLab Production Deployment Guide

## Architecture Recommendation

### Deployment Structure: Separate Frontend and Backend

**Recommended approach:** Deploy frontend and backend as separate services:

- **Backend:** Node.js/Express on a VPS (DigitalOcean, Linode, AWS EC2) or container platform (Railway, Render, Fly.io)
- **Frontend:** Static hosting (Vercel, Netlify, or AWS S3 + CloudFront)
- **Database:** MongoDB Atlas (managed service)

**Why separate?**
- Independent scaling
- Better security (backend can be private)
- Specialized hosting for each tier
- Easier CI/CD pipeline

---

## Environment Variables Required

### Backend (`.env`)

```bash
# Server
PORT=5000
NODE_ENV=production

# Database - MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster<number>.xxx.mongodb.net/artcollab?appName=Cluster0&retryWrites=true&w=majority

# JWT - Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64-character-random-string>

# Frontend URL (HTTPS required in production)
CLIENT_URL=https://your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend (`.env.production`)

```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## Production Domains/Origins

### Required CORS Configuration

In your backend `.env`:
```
CLIENT_URL=https://your-domain.com
```

**Cookie Settings:**
- `secure: true` (HTTPS only)
- `sameSite: 'strict'` (CSRF protection)
- `httpOnly: true` (XSS protection for JWT)

### Recommended Domain Structure

```
Frontend:  https://your-domain.com        (Vercel/Netlify/S3)
API:       https://api.your-domain.com   (VPS/Container)
Database:  MongoDB Atlas (managed)
```

---

## Files Changed/Added

### Environment Validation
- **`backend/src/utils/env.js`** - Enhanced production validation
  - Validates JWT_SECRET length (32+ chars)
  - Validates HTTPS for CLIENT_URL
  - Validates MongoDB URI format
  - Validates Stripe keys for production
  - Blocks localhost in production

### Backend Production
- **`backend/src/server.js`** - Production startup improvements
  - Environment validation on startup
  - Production-safe logging
  - Graceful shutdown handling

### Frontend Production
- **`frontend/src/services/api.js`** - Production-safe API configuration
  - Validates VITE_API_BASE_URL in production
  - Blocks localhost fallback in production
  - Validates HTTPS requirement

### Docker/Process Management
- **`backend/Dockerfile`** - Multi-stage production build
- **`backend/.dockerignore`** - Excludes dev files from image
- **`backend/ecosystem.config.js`** - PM2 process management

### CI/CD
- **`.github/workflows/ci.yml`** - GitHub Actions workflow
  - Backend tests
  - Frontend build
  - Artifact upload

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Generate JWT_SECRET**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] **Create MongoDB Atlas Cluster**
  - Use M0 free tier for testing
  - Configure network access (allow your server IP)
  - Get connection string

- [ ] **Configure Stripe**
  - Get live API keys
  - Create webhook endpoint: `https://api.your-domain.com/api/payments/webhook`
  - Get webhook signing secret

- [ ] **Configure Email (optional)**
  - Sign up for SendGrid
  - Verify sender email

- [ ] **Domain Setup**
  - Register domain
  - Configure DNS for frontend (A record or CNAME)
  - Configure DNS for API (CNAME to backend)

### Backend Deployment

- [ ] Set environment variables on hosting platform
- [ ] Test with: `NODE_ENV=production node src/server.js`
- [ ] Verify health endpoint: `https://api.your-domain.com/api/health`
- [ ] Test Stripe webhook endpoint

### Frontend Deployment

- [ ] Build: `cd frontend && npm run build`
- [ ] Deploy dist folder to hosting
- [ ] Test login/logout flow
- [ ] Test payment flow (use Stripe test cards)
- [ ] Verify CSRF works (check browser console for errors)

### Post-Deployment Verification

- [ ] **Security**
  - [ ] JWT tokens are httpOnly cookies
  - [ ] CSRF protection working (check network tab)
  - [ ] CORS properly configured
  - [ ] No sensitive data in frontend code

- [ ] **Functionality**
  - [ ] User registration/login works
  - [ ] Artwork upload works
  - [ ] Payments process correctly
  - [ ] Password reset emails send (if configured)
  - [ ] Admin dashboard accessible

- [ ] **Monitoring**
  - [ ] Set up error logging (e.g., Sentry)
  - [ ] Set up uptime monitoring
  - [ ] Configure backup for MongoDB

---

## Quick Start Commands

### Local Production Test
```bash
# Backend
cd backend
cp .env.production.example .env
# Edit .env with production-like values
NODE_ENV=production npm start

# Frontend (separate terminal)
cd frontend
cp .env.production.example .env
# Edit .env with API URL
npm run build
npx serve dist
```

### Docker Deployment
```bash
# Build
cd backend
docker build -t artcollab-backend .

# Run
docker run -p 5000:5000 --env-file .env artcollab-backend
```

### PM2 Deployment (VPS)
```bash
# Install PM2
npm install -g pm2

# Start
cd backend
pm2 start ecosystem.config.js --env production

# Setup startup script
pm2 startup
pm2 save
```

---

## Final Blockers to Address Before Production

1. **Stripe Webhook** - Must be reachable from Stripe's servers
2. **Email Deliverability** - Configure SPF/DKIM for SendGrid
3. **HTTPS** - Ensure SSL certificates are valid
4. **Domain DNS** - Point to correct hosting providers

---

## Support

For issues, check:
- Backend logs: `pm2 logs` or Docker logs
- Stripe Dashboard for payment issues
- MongoDB Atlas logs for database issues
