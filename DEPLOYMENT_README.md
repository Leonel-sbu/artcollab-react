# Deployment Guide for ARTCOLLAB-APP

This guide provides detailed instructions for deploying the ARTCOLLAB-APP using Git, Vercel (for frontend), and Render (for backend).

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Git Setup and Workflow](#git-setup-and-workflow)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Environment Variables](#environment-variables)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Git** installed on your local machine
2. **GitHub account** with a repository created for your project
3. **Vercel account** (sign up at [vercel.com](https://vercel.com))
4. **Render account** (sign up at [render.com](https://render.com))
5. **Node.js** (version 16 or higher) installed locally
6. **MongoDB** database (for production, use MongoDB Atlas)

## Project Structure

Your project should be structured as follows:

```
ARTCOLLAB-APP/
├── frontend/          # React/Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js/Express backend
│   ├── src/
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

## Git Setup and Workflow

### 1. Initialize Git Repository

If not already done:

```bash
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Add the remote origin:

```bash
git remote add origin https://github.com/yourusername/artcollab-app.git
git push -u origin main
```

### 3. Branching Strategy

Use feature branches for development:

```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

Create pull requests on GitHub to merge changes to main.

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. Ensure your frontend `package.json` has the correct build script:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

2. Create/update your `frontend/.env.production` file:

```env
VITE_API_URL=https://your-backend-name.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/` (if your frontend is in a subfolder)
   - **Build Command**: `npm run build` or `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables

In the Vercel dashboard, go to your project settings and add environment variables:

- `VITE_API_URL`: Your Render backend URL
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- Any other environment variables your frontend needs

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will automatically build and deploy your frontend
3. Once deployed, you'll get a URL like `https://artcollab-app.vercel.app`

### Step 5: Custom Domain (Optional)

To use a custom domain:
1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain and follow the DNS configuration instructions

## Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. Ensure your backend `package.json` has the correct scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'"
  },
  "engines": {
    "node": "18.x"
  }
}
```

2. Create a `.env` file for local development and ensure production environment variables are set in Render.

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** and select **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: artcollab-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend/` (if your backend is in a subfolder)

### Step 3: Environment Variables

In the Render dashboard, go to your service settings and add environment variables:

- `NODE_ENV`: production
- `PORT`: 10000 (or whatever Render assigns)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `EMAIL_USER`: Your email service username
- `EMAIL_PASS`: Your email service password
- Any other secrets your backend needs

### Step 4: Database Setup

1. Create a MongoDB Atlas account at [mongodb.com](https://mongodb.com)
2. Create a new cluster
3. Set up database user and whitelist IP addresses (0.0.0.0/0 for Render)
4. Get your connection string and add it as `MONGODB_URI` in Render

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your backend
3. Once deployed, you'll get a URL like `https://artcollab-backend.onrender.com`

## Environment Variables

### Frontend (.env.production or Vercel settings)

```env
VITE_API_URL=https://your-backend-name.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Backend (Render environment variables)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artcollab
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

## Post-Deployment Configuration

### 1. Update Frontend API Calls

Ensure your frontend API calls use the production backend URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 2. CORS Configuration

In your backend, configure CORS to allow requests from your Vercel domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://artcollab-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
};
```

### 3. File Uploads

If your app handles file uploads:
- Configure cloud storage (AWS S3, Cloudinary, etc.)
- Update upload paths in your backend
- Ensure proper permissions

## Monitoring and Maintenance

### Vercel Monitoring

- Check deployment logs in Vercel dashboard
- Monitor function performance and errors
- Set up analytics if needed

### Render Monitoring

- View logs in Render dashboard
- Monitor response times and errors
- Set up alerts for downtime

### Database Monitoring

- Use MongoDB Atlas dashboard to monitor database performance
- Set up backups and alerts

## Troubleshooting

### Common Frontend Issues

1. **Build Fails**: Check Node.js version compatibility and dependencies
2. **Environment Variables Not Loading**: Ensure variables are prefixed with `VITE_` for Vite
3. **CORS Errors**: Update backend CORS configuration

### Common Backend Issues

1. **Port Issues**: Render assigns ports automatically, use `process.env.PORT`
2. **Database Connection**: Verify MongoDB Atlas IP whitelisting and connection string
3. **Memory Issues**: Monitor resource usage and optimize if needed

### Git Issues

1. **Push Fails**: Check remote origin and branch names
2. **Merge Conflicts**: Resolve conflicts locally before pushing

## Deployment Checklist

- [ ] Git repository set up and pushed to GitHub
- [ ] Frontend dependencies installed and builds successfully
- [ ] Backend dependencies installed and starts without errors
- [ ] Environment variables configured for production
- [ ] Database connection tested
- [ ] CORS configured for production domains
- [ ] File upload paths updated for production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates (handled automatically by Vercel/Render)
- [ ] Monitoring and alerts set up

## Support

If you encounter issues:
1. Check deployment logs in Vercel/Render dashboards
2. Verify environment variables are set correctly
3. Test locally with production environment variables
4. Check MongoDB Atlas connection and permissions

For more help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)</content>
<parameter name="filePath">C:\dev\ARTCOLLAB-APP\DEPLOYMENT_README.md