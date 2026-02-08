# MongoDB Atlas Connection Troubleshooting

## ✅ IP Whitelist is Configured

You have `0.0.0.0/0` whitelisted, so IP access is not the issue.

## Common Issues & Solutions

### 1. Check Database User Permissions

**Go to:** https://cloud.mongodb.com/v2#/security/database/users

1. Find user: `Srikrishna_user`
2. Click **"Edit"**
3. Make sure permissions are set to: **"Read and write to any database"**
4. Save changes

### 2. Verify Password

The password `123456789` should work, but check:
- No extra spaces in `.env` file
- Password matches exactly in MongoDB Atlas

### 3. Check Cluster Status

**Go to:** https://cloud.mongodb.com/v2#/clusters

1. Make sure your cluster is **RUNNING** (not paused)
2. Free tier clusters auto-pause after inactivity
3. If paused, click **"Resume"** and wait 1-2 minutes

### 4. Test Connection String Format

Your connection string should be:
```
mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/auth_system?retryWrites=true&w=majority
```

**Important points:**
- Database name: `auth_system` (will be created automatically)
- No spaces before/after the connection string
- Special characters in password might need URL encoding

### 5. URL Encode Password (if needed)

If your password has special characters, they need to be URL-encoded:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

Your password `123456789` doesn't need encoding, but if you change it later, remember this.

### 6. Increase Connection Timeout

The connection timeout is set to 5 seconds. If your network is slow, try increasing it.

Edit `server/src/config/db.js`:
```javascript
serverSelectionTimeoutMS: 10000,  // Increase to 10 seconds
```

### 7. Test with MongoDB Compass

1. Download: https://www.mongodb.com/try/download/compass
2. Connect using:
   ```
   mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/?appName=Cluster0
   ```
3. If Compass connects but your app doesn't, the issue is in the connection string format

### 8. Check Firewall/Antivirus

- Temporarily disable firewall/antivirus to test
- Some corporate networks block MongoDB connections

### 9. Verify .env File Location

Make sure your `.env` file is in the `server/` directory (same level as `package.json`)

### 10. Check for Typos

Double-check your `.env` file:
- No extra quotes around the connection string
- No trailing spaces
- Correct username: `Srikrishna_user` (case-sensitive)
- Correct password: `123456789`

---

## Quick Test Commands

### Test Connection String Directly

```bash
cd server
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

This should print your connection string (password will be visible).

### Test MongoDB Connection

Create a test file `test-connection.js`:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
```

Run:
```bash
node test-connection.js
```

---

## Still Not Working?

1. **Check MongoDB Atlas Logs:**
   - Go to: Monitoring → Logs
   - Look for connection attempts and errors

2. **Try Creating a New Database User:**
   - Go to: Database Access → Add New Database User
   - Username: `test_user`
   - Password: `test123456`
   - Permissions: Read and write to any database
   - Update `.env` with new credentials and test

3. **Contact Support:**
   - MongoDB Atlas has 24/7 support
   - Check their status page: https://status.mongodb.com/
