# Environment Variables Setup Guide

This guide will help you set up all required environment variables for the authentication system.

## Quick Setup

### Option 1: Auto-Generate .env (Recommended)

Run the setup script to automatically generate a `.env` file with secure random JWT secrets:

```bash
npm run setup:env
```

Then edit the `.env` file and add your MongoDB URI and SMTP credentials.

### Option 2: Manual Setup

1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and fill in all required values (see below).

---

## Required Environment Variables

### 1. Server Configuration

```env
NODE_ENV=development
PORT=5000
```

- `NODE_ENV`: Set to `development` for local dev, `production` for production
- `PORT`: Server port (default: 5000)

---

### 2. MongoDB Database (REQUIRED)

**Option A: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/auth_system
```

**Option B: MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auth_system?retryWrites=true&w=majority
```

**How to get MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

---

### 3. JWT Secrets (REQUIRED)

**Generate secure secrets:**

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Add to .env:**
```env
JWT_ACCESS_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

⚠️ **IMPORTANT:** 
- Never use the same secret for both access and refresh tokens
- Use different secrets in production
- Keep secrets secure and never commit them to git

---

### 4. Email Configuration (SMTP)

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Google Account
2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App Passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to .env:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

#### Option B: SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Add to .env:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

#### Option C: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get SMTP credentials from dashboard
3. Add to .env:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

#### Option D: Development Mode (No Email)

If you don't configure SMTP, emails will be logged to console in development mode.

---

### 5. Client Application

```env
CLIENT_URL=http://localhost:3000
```

For production:
```env
CLIENT_URL=https://yourdomain.com
```

---

### 6. Password Hashing

```env
BCRYPT_SALT_ROUNDS=12
```

- Recommended: 10-12 for production
- Higher = more secure but slower
- Don't go above 14 (too slow)

---

## Complete .env Template

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/auth_system

# JWT (Generate secure secrets!)
JWT_ACCESS_SECRET=your_super_secret_access_token_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Client
CLIENT_URL=http://localhost:3000

# Bcrypt
BCRYPT_SALT_ROUNDS=12
```

---

## Verification

After setting up your `.env` file, verify it works:

```bash
# Start the server
npm run dev

# Check for errors
# If you see "MongoDB connected" and no errors, you're good!
```

---

## Security Checklist

- [ ] JWT secrets are strong and unique (32+ characters)
- [ ] Different secrets for access and refresh tokens
- [ ] MongoDB URI includes password (if using Atlas)
- [ ] SMTP password is an app password (not regular password)
- [ ] `.env` is in `.gitignore` (never commit it!)
- [ ] Production secrets are different from development

---

## Troubleshooting

### "Missing required environment variable: JWT_ACCESS_SECRET"
- Make sure `.env` file exists in the `server/` directory
- Check that JWT secrets are set (not empty)

### "MongoDB connection failed"
- Verify MongoDB is running (if local)
- Check MongoDB URI is correct
- For Atlas: Check IP whitelist and credentials

### "Email sending failed"
- Verify SMTP credentials are correct
- For Gmail: Make sure you're using App Password (not regular password)
- Check firewall/network allows SMTP connections

### "CORS error"
- Make sure `CLIENT_URL` matches your frontend URL exactly
- Check for trailing slashes

---

## Production Deployment

For production, set:

```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
MONGODB_URI=your_production_mongodb_uri
JWT_ACCESS_SECRET=production_secret_1
JWT_REFRESH_SECRET=production_secret_2
SMTP_HOST=your_production_smtp
SMTP_USER=your_production_email
SMTP_PASS=your_production_password
```

**Never use development secrets in production!**
