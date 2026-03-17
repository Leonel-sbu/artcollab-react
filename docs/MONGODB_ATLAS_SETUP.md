# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"** → Create a free account
3. Select **"Free"** (M0) cluster - no credit card required

## Step 2: Create Cluster

1. After login, click **"Create"** 
2. Choose **"Free"** tier (M0)
3. Select a provider (AWS/Google Cloud/Azure) - choose closest to you
4. Click **"Create Cluster"** - wait 1-3 minutes

## Step 3: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Create user:
   - Username: `artcollab`
   - Password: `YourSecurePassword123` (remember this!)
4. Click **"Add User"**

## Step 4: Network Access (Allow All for Development)

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Drivers"**
4. Copy the connection string:
```
mongodb+srv://artcollab:<password>@cluster0.xxxxx.mongodb.net/artcollab?retryWrites=true&w=majority
```

**Important:** Replace `<password>` with your actual password!

## Step 6: Update .env File

Edit `backend/.env` and replace the MONGO_URI line:

```env
# Old (local):
MONGO_URI=mongodb://127.0.0.1:27017/artcollab

# New (Atlas):
MONGO_URI=mongodb+srv://artcollab:YourSecurePassword123@cluster0.xxxxx.mongodb.net/artcollab?retryWrites=true&w=majority
```

## Step 7: Restart Backend

```bash
# Stop current server (Ctrl+C)
# Restart:
cd backend && npm start
```

## Verify Connection

```bash
curl http://localhost:5000/api/health
```

Should return: `{"success":true,"status":"ok","database":"connected"}`

---

## ⚠️ Important Notes

- **Local MongoDB** = Runs on your computer, only you can access
- **MongoDB Atlas** = Cloud database, accessible from anywhere
- For production, use MongoDB Atlas
- Keep your connection string secret - never commit to GitHub!
