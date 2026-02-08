# MongoDB Atlas Connection Setup Guide

## Error Message
```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Quick Fix: Whitelist Your IP Address

### Step 1: Get Your Current IP Address

**Windows:**
```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Or Command Prompt
curl https://api.ipify.org
```

**Mac/Linux:**
```bash
curl https://api.ipify.org
```

**Or visit:** https://www.whatismyip.com/

### Step 2: Add IP to MongoDB Atlas Whitelist

1. **Log in to MongoDB Atlas:**
   - Go to https://cloud.mongodb.com/
   - Sign in with your account

2. **Navigate to Network Access:**
   - Click on your project/cluster
   - In the left sidebar, click **"Network Access"** (or **"Security" → "Network Access"**)

3. **Add IP Address:**
   - Click **"Add IP Address"** button
   - You have two options:

   **Option A: Add Your Current IP (Recommended for Production)**
   - Click **"Add Current IP Address"** button (if available)
   - Or manually enter your IP address
   - Click **"Confirm"**

   **Option B: Allow Access from Anywhere (Development Only)**
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` to the whitelist
   - ⚠️ **WARNING:** Only use this for development/testing!
   - Click **"Confirm"**

4. **Wait for Changes:**
   - It may take 1-2 minutes for the changes to propagate
   - You'll see a green checkmark when it's active

### Step 3: Verify Database User Permissions

1. **Go to Database Access:**
   - In the left sidebar, click **"Database Access"**

2. **Check Your User:**
   - Find user: `Srikrishna_user`
   - Make sure it has **"Read and write to any database"** permissions
   - If not, click **"Edit"** and change permissions to **"Read and write to any database"**

3. **Verify Password:**
   - Make sure the password is: `123456789`
   - If you changed it, update your `.env` file

### Step 4: Test Connection

After whitelisting your IP, restart your server:

```bash
cd server
npm run dev
```

You should see:
```
[DB] MongoDB connected: cluster0.ewyl7sr.mongodb.net
```

---

## Alternative: Use MongoDB Compass to Test

1. **Download MongoDB Compass:**
   - https://www.mongodb.com/try/download/compass

2. **Connect using your connection string:**
   ```
   mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/?appName=Cluster0
   ```

3. **If connection succeeds in Compass but not in your app:**
   - Check your `.env` file has the correct connection string
   - Make sure you're using the full connection string with database name:
     ```
     mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/auth_system?retryWrites=true&w=majority
     ```

---

## Troubleshooting

### Still Can't Connect?

1. **Check Firewall:**
   - Make sure your firewall isn't blocking MongoDB connections
   - MongoDB Atlas uses port 27017 (or 27017-27019)

2. **Verify Connection String:**
   - Make sure there are no extra spaces in your `.env` file
   - Check that the password doesn't have special characters that need URL encoding

3. **Check Cluster Status:**
   - In MongoDB Atlas, make sure your cluster is running (not paused)
   - Free tier clusters pause after inactivity

4. **Try Different Network:**
   - If you're on a corporate network, try from a different network
   - Some networks block MongoDB connections

5. **Check MongoDB Atlas Logs:**
   - Go to MongoDB Atlas → Monitoring → Logs
   - Look for connection errors

---

## Security Best Practices

### For Development:
- Use `0.0.0.0/0` (allow from anywhere) only for local development
- Remove it before deploying to production

### For Production:
- Only whitelist specific IP addresses
- Use your server's static IP address
- Regularly review and remove unused IP addresses
- Consider using VPC peering for AWS/GCP/Azure deployments

---

## Quick Reference

**Your MongoDB Connection String:**
```
mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/auth_system?retryWrites=true&w=majority
```

**MongoDB Atlas Dashboard:**
- https://cloud.mongodb.com/

**Network Access URL:**
- https://cloud.mongodb.com/v2#/security/network/whitelist

**Database Access URL:**
- https://cloud.mongodb.com/v2#/security/database/users
