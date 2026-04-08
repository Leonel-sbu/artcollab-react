# MongoDB Atlas Connection Fix

## The Issue
Your current IP address is not whitelisted in MongoDB Atlas, preventing the application from connecting to the database.

## Solution: Allow Access from Anywhere

Follow these steps in MongoDB Atlas:

### Step 1: Access MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Log in to your account

### Step 2: Navigate to Network Access
1. Click on **"Network Access"** in the left sidebar
2. You'll see a list of IP addresses that are allowed to connect

### Step 3: Add IP Whitelist Entry
1. Click the **"Add IP Address"** button
2. In the **"Access List Entry"** field, enter:
   ```
   0.0.0.0/0
   ```
3. This allows access from any IP address (development only)
4. Optionally add a comment like "ArtCollab Development"
5. Click **"Confirm"**

### Step 4: Wait for Changes to Apply
- It may take 1-2 minutes for the changes to propagate
- You'll see a notification when it's active

## Alternative: Add Your Specific IP

If you prefer more security:

1. Visit https://whatismyipaddress.com to get your current IP
2. In MongoDB Atlas, add your IP in format: `YOUR_IP/32` (e.g., `192.168.1.1/32`)

## After Whitelist is Updated

Once you've added the IP whitelist, restart the backend:

```bash
cd backend
node src/server.js
```

The server should now connect to MongoDB Atlas successfully.

## Security Note
- `0.0.0.0/0` is not recommended for production
- In production, use specific IP addresses or VPC peering
- For production, consider using MongoDB Atlas VPN or private endpoints
