# MongoDB Connection Fix Guide

## ✅ Your IP is Already Whitelisted

You have `0.0.0.0/0` configured, so IP access is **NOT** the problem.

## 🔍 Next Steps to Fix Connection

### Step 1: Test the Connection

Run the test script to get detailed error information:

```bash
cd server
npm run test:db
```

This will show you exactly what's wrong.

### Step 2: Common Issues to Check

#### A. Database User Permissions

1. Go to: https://cloud.mongodb.com/v2#/security/database/users
2. Find user: `Srikrishna_user`
3. Click **"Edit"**
4. Set permissions to: **"Read and write to any database"**
5. Save

#### B. Cluster Status

1. Go to: https://cloud.mongodb.com/v2#/clusters
2. Make sure cluster is **RUNNING** (not paused)
3. If paused, click **"Resume"** and wait 1-2 minutes

#### C. Verify .env File

Make sure your `.env` file in `server/` directory has:

```env
MONGODB_URI=mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/auth_system?retryWrites=true&w=majority
```

**Check for:**
- No extra spaces
- No quotes around the connection string
- Correct username and password

### Step 3: Try These Solutions

#### Solution 1: Test with MongoDB Compass

1. Download: https://www.mongodb.com/try/download/compass
2. Connect with:
   ```
   mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/?appName=Cluster0
   ```
3. If Compass works but your app doesn't, the issue is in the connection string format

#### Solution 2: Check Password Encoding

If your password has special characters, they need URL encoding. Your password `123456789` is fine, but if you change it later:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

#### Solution 3: Increase Timeout

Already done! The timeout is now 10 seconds (increased from 5).

### Step 4: Run Test Again

```bash
npm run test:db
```

Look at the error message - it will tell you exactly what's wrong.

---

## 📋 Quick Checklist

- [ ] IP whitelisted (✅ You have this)
- [ ] Database user has "Read and write" permissions
- [ ] Cluster is running (not paused)
- [ ] `.env` file exists in `server/` directory
- [ ] Connection string is correct (no spaces, no quotes)
- [ ] Username and password are correct

---

## 🆘 Still Not Working?

1. Run: `npm run test:db` and share the error message
2. Check: `TROUBLESHOOTING.md` for detailed solutions
3. Verify: MongoDB Atlas → Monitoring → Logs for connection attempts
