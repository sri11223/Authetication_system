# Secure Authentication System (MERN Stack)

A production-grade, secure authentication system built with **Next.js**, **Express.js**, and **MongoDB**. Features email verification, JWT-based auth, multi-device session management, and race-condition-safe concurrent logins.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Session Management Strategy](#session-management-strategy)
- [Race Condition Handling](#race-condition-handling)
- [Chat System Architecture](#chat-system-architecture)

---

## Features

- **User Registration** — Email/password signup with bcrypt hashing
- **Email Verification** — Token-based verification links (24h expiry)
- **JWT Authentication** — Access + Refresh token strategy with HTTP-only cookies
- **Protected Routes** — Dashboard accessible only after authentication
- **Forgot Password** — Email-based reset with single-use, expiring tokens
- **Session Management** — Track all active sessions with device info, IP, and last active time
- **Device Revocation** — Revoke access from any specific device
- **Logout** — Current device or all devices simultaneously
- **Race Condition Safety** — MongoDB atomic operations + transactions for concurrent logins
- **Rate Limiting** — Configurable rate limits on auth endpoints
- **Security Headers** — Helmet.js for HTTP security headers
- **Input Validation** — Joi schema validation on all endpoints
- **Clean UI** — Modern, responsive interface with Tailwind CSS

---

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js                         |
| Database   | MongoDB with Mongoose ODM                   |
| Auth       | JWT (Access + Refresh), bcryptjs            |
| Email      | Nodemailer (SMTP)                           |
| Validation | Joi                                         |
| Security   | Helmet, CORS, Rate Limiting, HTTP-only Cookies |

---

## Project Structure

```
├── server/                         # Express.js Backend
│   ├── src/
│   │   ├── config/                 # Database, email, environment config
│   │   │   ├── db.js
│   │   │   ├── email.js
│   │   │   └── env.js
│   │   ├── controllers/            # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   └── session.controller.js
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.js             # JWT authentication guard
│   │   │   ├── errorHandler.js     # Global error handler
│   │   │   ├── rateLimiter.js      # Rate limiting configs
│   │   │   └── validate.js         # Joi validation middleware
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Session.js          # With unique compound index
│   │   │   └── Token.js            # Email verification & reset tokens
│   │   ├── routes/                 # Express routes
│   │   │   ├── auth.routes.js
│   │   │   └── session.routes.js
│   │   ├── services/               # Business logic layer
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   ├── session.service.js  # Race-condition-safe session creation
│   │   │   └── token.service.js
│   │   ├── utils/                  # Helpers and utilities
│   │   │   ├── ApiError.js
│   │   │   ├── asyncHandler.js
│   │   │   └── helpers.js
│   │   ├── validators/             # Joi validation schemas
│   │   │   └── auth.validator.js
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Entry point
│   └── package.json
│
├── client/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── dashboard/          # Protected dashboard
│   │   │   ├── forgot-password/    # Password reset request
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Registration page
│   │   │   ├── reset-password/     # Password reset form
│   │   │   ├── sessions/           # Session management
│   │   │   ├── verify-email/       # Email verification
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Landing page
│   │   ├── components/
│   │   │   ├── layout/             # Layout components (Navbar, AuthLayout)
│   │   │   ├── sessions/           # Session management components
│   │   │   └── ui/                 # Shared UI (Button, Input, Card, Alert, etc.)
│   │   ├── constants/              # App constants and route definitions
│   │   ├── context/                # React Context (AuthContext)
│   │   ├── hooks/                  # Custom hooks (useAuth, useForm, useSessions)
│   │   ├── lib/                    # Axios client with interceptors
│   │   ├── services/               # API service layer
│   │   └── types/                  # TypeScript interfaces
│   └── package.json
│
├── ARCHITECTURE.md                 # WhatsApp-like chat system design
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js >= 18
- MongoDB >= 6.0 (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Authetication_system
```

### 2. Backend Setup

```bash
cd server
npm install

# Create environment file (choose one method):
# Method 1: Auto-generate with secure secrets (Recommended)
npm run setup:env

# Method 2: Manual copy
cp env.example .env

# Then edit .env with your configuration (see Environment Variables section)
# Quick reference: See server/ENV_QUICK_START.txt
# Detailed guide: See server/ENV_SETUP.md

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## Environment Variables

### Quick Setup

**Option 1: Auto-Generate (Recommended)**
```bash
cd server
npm run setup:env
```
This automatically creates a `.env` file with secure random JWT secrets. Then edit it to add your MongoDB URI and SMTP credentials.

**Option 2: Manual Setup**
```bash
cd server
cp env.example .env
# Edit .env with your values
```

**Quick Reference:** See `server/ENV_QUICK_START.txt` for copy-paste template  
**Detailed Guide:** See `server/ENV_SETUP.md` for complete instructions

### Required Variables

| Variable             | Description                  | Default/Example                     | Required |
| -------------------- | ---------------------------- | ----------------------------------- | -------- |
| `NODE_ENV`           | Environment mode             | `development`                       | No       |
| `PORT`               | Server port                  | `5000`                              | No       |
| `MONGODB_URI`        | MongoDB connection string    | `mongodb://localhost:27017/auth_system` | Yes |
| `JWT_ACCESS_SECRET`  | Access token signing secret  | *(auto-generated)*                  | **Yes**  |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | *(auto-generated)*                  | **Yes**  |
| `JWT_ACCESS_EXPIRY`  | Access token lifetime        | `15m`                               | No       |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime       | `7d`                                | No       |
| `SMTP_HOST`          | Email server host            | `smtp.gmail.com`                    | Yes*     |
| `SMTP_PORT`          | Email server port            | `587`                               | Yes*     |
| `SMTP_USER`          | Email account                | `your_email@gmail.com`              | Yes*     |
| `SMTP_PASS`          | Email app password           | `your_app_password`                 | Yes*     |
| `CLIENT_URL`         | Frontend URL                 | `http://localhost:3000`             | No       |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds      | `12`                                | No       |

\* *Required for email functionality. In development, emails are logged to console if SMTP is not configured.*

### Generate JWT Secrets

**Windows (PowerShell):**
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## API Documentation

### Auth Endpoints

| Method | Endpoint                      | Description              | Auth |
| ------ | ----------------------------- | ------------------------ | ---- |
| POST   | `/api/auth/register`          | Register new user        | No   |
| POST   | `/api/auth/login`             | Login user               | No   |
| POST   | `/api/auth/verify-email`      | Verify email token       | No   |
| POST   | `/api/auth/refresh-token`     | Refresh access token     | No   |
| POST   | `/api/auth/forgot-password`   | Request password reset   | No   |
| POST   | `/api/auth/reset-password`    | Reset password           | No   |
| POST   | `/api/auth/resend-verification` | Resend verification email | No |
| GET    | `/api/auth/me`                | Get current user         | Yes  |
| POST   | `/api/auth/logout`            | Logout current device    | Yes  |
| POST   | `/api/auth/logout-all`        | Logout all devices       | Yes  |

### Session Endpoints

| Method | Endpoint                     | Description              | Auth |
| ------ | ---------------------------- | ------------------------ | ---- |
| GET    | `/api/sessions`              | Get all active sessions  | Yes  |
| DELETE | `/api/sessions/:sessionId`   | Revoke specific session  | Yes  |
| DELETE | `/api/sessions`              | Revoke all other sessions| Yes  |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass1!",
  "confirmPassword": "StrongPass1!"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "StrongPass1!"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
// + HttpOnly cookie: refreshToken
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     REGISTRATION FLOW                            │
│                                                                  │
│  User submits form → Server hashes password with bcrypt          │
│  → Saves user (isEmailVerified: false)                           │
│  → Generates verification token (SHA-256 hashed in DB)           │
│  → Sends email with verification link                            │
│  → User clicks link → Token consumed atomically                  │
│  → User marked as verified                                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                                 │
│                                                                  │
│  User submits credentials → Verify password with bcrypt          │
│  → Check email is verified                                       │
│  → Create session (atomic upsert per device fingerprint)         │
│  → Generate JWT access token (15min) + refresh token (7d)        │
│  → Access token in response body, refresh token in HttpOnly cookie│
│  → Client stores access token in localStorage                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    TOKEN REFRESH FLOW                             │
│                                                                  │
│  Access token expires → Axios interceptor catches 401            │
│  → Sends refresh token (from HttpOnly cookie) to /refresh-token  │
│  → Server validates refresh token, verifies session is active    │
│  → Generates new token pair (rotation)                           │
│  → Retries failed request with new access token                  │
│  → Queues concurrent failed requests during refresh              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   PASSWORD RESET FLOW                            │
│                                                                  │
│  User requests reset → Server generates token (1h expiry)        │
│  → Sends email with reset link                                   │
│  → User submits new password with token                          │
│  → Token consumed atomically (single-use)                        │
│  → Password updated, passwordChangedAt set                       │
│  → ALL active sessions invalidated                               │
│  → User must log in again on all devices                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Session Management Strategy

### Device Tracking

Each login creates a session record with:
- **Device fingerprint** — MD5 hash of `User-Agent + IP`
- **Device info** — Browser, OS, platform, device type (parsed from User-Agent)
- **IP address** — Extracted via `request-ip`
- **Timestamps** — Created at, last active at, expires at

### Session Storage

Sessions are stored in MongoDB with:
- **TTL index** on `expiresAt` for automatic cleanup
- **Compound unique index** on `(userId, deviceFingerprint, isActive)` to prevent duplicates
- **Refresh token** stored as SHA-256 hash (never in plain text)

### Session Lifecycle

1. **Created** on login (atomic upsert per device)
2. **Updated** on each authenticated request (lastActiveAt)
3. **Rotated** on token refresh (new refresh token hash)
4. **Revoked** on logout, password reset, or manual revocation
5. **Expired** automatically after 7 days via MongoDB TTL

---

## Race Condition Handling

### Problem

When a user logs in from two different devices simultaneously, both requests hit the database at the same time. Without proper handling, this can cause:
- Duplicate sessions for the same device
- Inconsistent session counts
- Data integrity violations

### Solution: Multi-Layer Defense

#### Layer 1: Unique Partial Index (Database Level)

```javascript
// Session model — prevents duplicate active sessions at the DB level
sessionSchema.index(
  { userId: 1, deviceFingerprint: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);
```

This index ensures that MongoDB **atomically rejects** any attempt to create a second active session for the same device-user combination, even under concurrent writes.

#### Layer 2: Atomic Upsert (Application Level)

```javascript
// session.service.js — atomic "create-or-update" operation
const session = await Session.findOneAndUpdate(
  { userId, deviceFingerprint, isActive: true },
  {
    $set: { deviceInfo, lastActiveAt, expiresAt },
    $setOnInsert: { userId, deviceFingerprint, isActive: true },
  },
  { upsert: true, new: true, session: mongoSession }
);
```

`findOneAndUpdate` with `upsert: true` is atomic — if two concurrent requests try to create a session:
- One succeeds with an insert
- The other finds the existing document and updates it
- No duplicates are created

#### Layer 3: MongoDB Transaction (Consistency)

```javascript
const mongoSession = await mongoose.startSession();
mongoSession.startTransaction({
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
});

try {
  // 1. Upsert session (atomic)
  // 2. Update refresh token
  // 3. Update user's active session count
  await mongoSession.commitTransaction();
} catch (error) {
  await mongoSession.abortTransaction();
  // Handle duplicate key error (race condition fallback)
}
```

The transaction with `snapshot` read concern ensures:
- All operations see a consistent snapshot of the data
- The session count is accurate even under concurrency
- If anything fails, the entire transaction rolls back

#### Layer 4: Duplicate Key Error Handling (Fallback)

```javascript
if (error.code === 11000) {
  // Another concurrent request won the race
  // Find the existing session and update it instead
  const existingSession = await Session.findOne({
    userId, deviceFingerprint, isActive: true
  });
  // Update and return
}
```

If the unique index catches a race condition that slipped past the upsert, the error is gracefully handled by updating the existing session.

### Edge Cases Handled

| Scenario                                  | Behavior                                      |
| ----------------------------------------- | --------------------------------------------- |
| Same device, simultaneous logins           | One upserts, other updates — single session   |
| Different devices, simultaneous logins     | Each gets its own session (different fingerprint) |
| Login during active session on same device | Existing session is updated (not duplicated)  |
| Transaction failure                        | Rolls back, retries with fallback logic       |
| Session count inconsistency               | Recalculated atomically within the transaction |

---

## Chat System Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete WhatsApp-like real-time chat system design, covering:

- High-level system architecture
- WebSocket vs REST communication choice
- Database schema (users, conversations, messages)
- Message delivery flow (sent → delivered → read)
- Online/offline presence handling
- Multi-device synchronization strategy
- Scalability and failure scenario handling

---

## Security Practices

| Practice                   | Implementation                                           |
| -------------------------- | -------------------------------------------------------- |
| Password Hashing           | bcrypt with 12 salt rounds                               |
| Token Storage              | SHA-256 hashed in DB, never stored in plain text         |
| Refresh Token              | HTTP-only, secure, SameSite cookie                       |
| Token Rotation             | New refresh token on each refresh request                |
| Rate Limiting              | 10 auth attempts / 15min, 5 reset attempts / hour        |
| Input Validation           | Joi schemas on all endpoints                             |
| Security Headers           | Helmet.js (CSP, HSTS, X-Frame-Options, etc.)            |
| CORS                       | Restricted to frontend origin only                       |
| Error Messages             | Generic auth errors to prevent enumeration               |
| Password Requirements      | Min 8 chars, uppercase, lowercase, number, special char  |
| Email Enumeration           | Forgot password always returns success message           |
| Session Invalidation       | Password reset invalidates all sessions                  |
| Single-Use Tokens          | Verification/reset tokens consumed atomically            |
