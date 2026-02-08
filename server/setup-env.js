const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Setup script to generate .env file with secure random secrets
 * Run: node setup-env.js
 */

const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

const envTemplate = `# ============================================
# SERVER CONFIGURATION
# ============================================
# Environment: development | production
NODE_ENV=development

# Server port (default: 5000)
PORT=5000

# ============================================
# MONGODB DATABASE
# ============================================
# MongoDB Atlas Connection (Your credentials)
MONGODB_URI=mongodb+srv://Srikrishna_user:123456789@cluster0.ewyl7sr.mongodb.net/auth_system?retryWrites=true&w=majority

# ============================================
# JWT TOKEN SECRETS (REQUIRED - AUTO-GENERATED)
# ============================================
# These secrets were auto-generated. Keep them secure!
# Access token secret (for short-lived tokens - 15 minutes)
JWT_ACCESS_SECRET=${generateSecret()}

# Refresh token secret (for long-lived tokens - 7 days)
JWT_REFRESH_SECRET=${generateSecret()}

# Token expiration times
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
# Gmail SMTP Configuration:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Your Gmail address
SMTP_USER=your_email@gmail.com

# Gmail App Password (NOT your regular password!)
# To generate: Google Account → Security → 2-Step Verification → App Passwords
SMTP_PASS=your_gmail_app_password_here

# Alternative: SendGrid SMTP
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your_sendgrid_api_key

# Alternative: Mailgun SMTP
# SMTP_HOST=smtp.mailgun.org
# SMTP_PORT=587
# SMTP_USER=your_mailgun_username
# SMTP_PASS=your_mailgun_password

# ============================================
# CLIENT APPLICATION
# ============================================
# Frontend URL (Next.js app)
CLIENT_URL=http://localhost:3000

# Production frontend URL (uncomment for production):
# CLIENT_URL=https://yourdomain.com

# ============================================
# PASSWORD HASHING
# ============================================
# Bcrypt salt rounds (higher = more secure but slower)
# Recommended: 10-12 for production
BCRYPT_SALT_ROUNDS=12
`;

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to regenerate it, delete the existing .env file first.');
  process.exit(0);
}

// Write .env file
fs.writeFileSync(envPath, envTemplate, 'utf8');

console.log('✅ .env file created successfully!');
console.log('');
console.log('📝 Next steps:');
console.log('   1. ✅ MongoDB URI is already configured with your credentials');
console.log('   2. Add your SMTP credentials (Gmail, SendGrid, etc.)');
console.log('   3. JWT secrets have been auto-generated (keep them secure!)');
console.log('');
console.log('🔐 Security Note:');
console.log('   - Never commit .env to version control');
console.log('   - Change JWT secrets in production');
console.log('   - Use strong SMTP passwords');
console.log('');
console.log('📌 MongoDB Connection:');
console.log('   mongodb+srv://Srikrishna_user:***@cluster0.ewyl7sr.mongodb.net/auth_system');
console.log('   Make sure your IP is whitelisted in MongoDB Atlas Network Access!');