# ArtColLab Deployment Guide

**Version:** 1.0.0  
**Last Updated:** March 29, 2026

---

## 1. Quick Start

### Development
```bash
# Terminal 1 - Backend
cd backend
npm install
node src/server.js

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Backend
cd backend
npm install
pm2 start ecosystem.config.js --env production

# Frontend
cd frontend
npm install
npm run build
npm run preview
```

---

## 2. Environment Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/artcollab?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=https://your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG....
SMTP_FROM=your-email@gmail.com
```

### Frontend (.env.production)
```env
VITE_API_URL=https://api.your-domain.com
```

---

## 3. Deployment Options

### Option A: Manual Server (VPS)

#### Backend
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/your-repo/artcollab-app.git
cd artcollab-app/backend
npm install --production

# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Frontend
```bash
cd artcollab-app/frontend
npm install
npm run build

# Serve with nginx
# Or: npm install -g serve
# serve -s dist -l 5173
```

#### Nginx Config
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/artcollab/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

---

### Option B: Docker

#### Backend Image Build & Run
```bash
cd backend
docker build -t artcollab-backend .
docker run -d --name artcollab-backend -p 5000:5000 --env-file .env artcollab-backend
```

#### Frontend Build & Run
```bash
cd frontend
docker build -t artcollab-frontend .
docker run -d --name artcollab-frontend -p 5173:5173 artcollab-frontend
```

---

### Option C: PM2 with Cloud Provider

#### Required Environment Variables
| Variable | Production Value |
|-----------|-----------------|
| NODE_ENV | production |
| PORT | 5000 |
| MONGO_URI | Atlas connection string |
| JWT_SECRET | Generated secure key |
| CLIENT_URL | https://your-domain.com |
| STRIPE_SECRET_KEY | sk_live_... |
| STRIPE_WEBHOOK_SECRET | whsec_... |

---

## 4. MongoDB Atlas Setup

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/artcollab?retryWrites=true&w=majority
```

### Atlas Configuration
1. **Create Cluster:** AWS/Firebase/GCP (choose region close to users)
2. **Database User:** Create user with readWrite access to artcollab database
3. **Network Access:** Add IP whitelist
   - For development: 0.0.0.0/0
   - For production: Server IP only
4. **Index:** Ensure indexes on commonly queried fields

---

## 5. Stripe Configuration

### Live Keys
1. Get keys from https://dashboard.stripe.com/apikeys
2. Set `STRIPE_SECRET_KEY` to live secret key
3. Configure webhook at https://dashboard.stripe.com/webhooks

### Webhook Endpoint
```
https://your-domain.com/api/payments/webhook
```

### CLI for Testing
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## 6. Health Checks

### Backend Health
```bash
curl https://api.your-domain.com/api/health
# Response: {"success":true,"status":"ok","database":"connected"}
```

### Frontend
- Serve static files or use CDN
- Verify all routes work

---

## 7. Security Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] JWT_SECRET is unique and secure (64+ chars)
- [ ] STRIPE_SECRET_KEY is live key for production
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] XSS protection enabled (Helmet)
- [ ] Admin accounts created via seed script (not registration)

---

## 8. Logging & Monitoring

### PM2 Commands
```bash
pm2 logs artcollab-backend
pm2 monit
pm2 status
```

### Log Files
- Backend: `logs/pm2-out.log`, `logs/pm2-error.log`

---

## 9. Troubleshooting

### Common Issues

**MongoDB Connection Timeout**
- Check IP whitelist in Atlas
- Verify connection string format

**Stripe Webhooks Not Working**
- Ensure webhook URL is publicly accessible
- Check webhook secret matches

**CORS Errors**
- Verify CLIENT_URL in .env
- Check allowed origins in app.js

---

## 10. Deployment Commands Summary

```bash
# Backend
cd backend
npm install --production
pm2 start ecosystem.config.js --env production
pm2 save

# Frontend  
cd frontend
npm install
npm run build

# Verify
curl http://localhost:5000/api/health
curl http://localhost:5173
```

---

## 11. Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite 7, Tailwind CSS |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas (Mongoose 8) |
| Auth | JWT, bcryptjs |
| Payments | Stripe |
| Email | SendGrid |
| Deployment | PM2, Docker, Nginx |
