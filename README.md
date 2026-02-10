# 🔐 Secure Authentication System

> A production-grade, enterprise-level authentication system built with the MERN stack. Engineered with a "defense-in-depth" philosophy — featuring race-condition-safe session management, two-factor authentication, and a real-time chat system architecture design.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Authentication Flow](#-authentication-flow)
- [Session Management](#-session-management-strategy)
- [Race Condition Handling](#-race-condition-handling)
- [Security Practices](#-security-practices)
- [Chat System Architecture](#-chat-system-architecture)

---

## ✨ Features

### Core Authentication
- **User Registration** — Email/password signup with bcrypt adaptive hashing (12 salt rounds)
- **Email Verification** — Cryptographic token-based verification with 24-hour expiry
- **JWT Authentication** — Dual-token strategy with access (15min) + refresh (7d) tokens
- **Protected Routes** — Middleware-based route guards with session validation
- **Forgot/Reset Password** — Secure reset flow with single-use tokens and full session invalidation

### Session Governance
- **Multi-Device Tracking** — Device fingerprinting, browser detection, IP logging
- **Session Revocation** — Revoke any individual session or all sessions at once
- **Race Condition Safety** — MongoDB atomic operations + transactions prevent duplicate sessions
- **Auto-Expiry** — TTL-indexed sessions with automatic cleanup

### Security Features
- **Two-Factor Authentication** — TOTP (Google Authenticator / Authy) + 10 backup codes
- **Account Lockout** — Progressive locking after 5 failed login attempts (2-hour cooldown)
- **Password History** — Prevents reuse of the last 3 passwords
- **Rate Limiting** — Configurable limits on auth, password reset, and verification endpoints
- **Security Headers** — Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- **Input Validation** — Joi schema validation on every endpoint

### Bonus Features
- **Admin Panel** — User management dashboard with analytics and system metrics
- **Activity Logging** — Immutable audit trail for all security-critical events
- **Email Notifications** — SendGrid (primary) with SMTP fallback for security alerts
- **Interactive API Docs** — Swagger UI at `/api-docs`
- **Responsive UI** — Modern Next.js 14 interface with Tailwind CSS
- **Deployment** — Live on Render (backend) + Vercel (frontend)

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS | SSR for auth pages, type safety, rapid UI |
| **Backend** | Node.js, Express.js | Non-blocking I/O for high-concurrency auth endpoints |
| **Database** | MongoDB with Mongoose ODM | Flexible schema + ACID transactions (v4.0+) |
| **Auth** | JWT (Access + Refresh), bcryptjs, speakeasy | Stateless auth, adaptive hashing, TOTP-based 2FA |
| **Email** | SendGrid (primary), Nodemailer/SMTP (fallback) | Reliable delivery with automatic failover |
| **Validation** | Joi | Declarative schema validation |
| **Security** | Helmet, CORS, express-rate-limit, HTTP-only Cookies | Multi-layer attack surface reduction |

---

## 📁 Project Structure

```
├── server/                          # Express.js Backend
│   ├── src/
│   │   ├── config/                  # DB, email, env, Swagger config
│   │   ├── controllers/             # HTTP request handlers
│   │   │   ├── auth.controller.js   # Auth flows (register, login, 2FA, etc.)
│   │   │   └── session.controller.js
│   │   ├── middleware/              # Express middleware layer
│   │   │   ├── auth.js              # JWT + session validation guard
│   │   │   ├── admin.middleware.js   # Admin role verification
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   ├── rateLimiter.js       # 4 rate limiters (auth, reset, verify, general)
│   │   │   └── validate.js          # Joi validation middleware
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js              # User with 2FA, lockout, password history
│   │   │   ├── Session.js           # With unique compound index for race safety
│   │   │   ├── Token.js             # Email verification & password reset tokens
│   │   │   └── ActivityLog.js       # Immutable audit trail
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/                # Business logic layer
│   │   │   ├── auth.service.js      # Core auth flows
│   │   │   ├── session.service.js   # Race-condition-safe session management
│   │   │   ├── twoFactor.service.js # TOTP generation, verification, backup codes
│   │   │   ├── email.service.js     # SendGrid + SMTP email delivery
│   │   │   ├── token.service.js     # JWT + action token management
│   │   │   └── admin.service.js     # Admin panel analytics
│   │   ├── validators/              # 12 Joi validation schemas
│   │   ├── utils/                   # ApiError, asyncHandler, helpers
│   │   └── docs/                    # Swagger YAML specifications
│   └── package.json
│
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── dashboard/           # Protected dashboard
│   │   │   ├── admin/               # Admin panel (users, analytics)
│   │   │   ├── sessions/            # Session management UI
│   │   │   ├── security/            # Security settings (2FA, password)
│   │   │   ├── login/               # Login with 2FA support
│   │   │   ├── register/            # Registration
│   │   │   ├── forgot-password/     # Password reset request
│   │   │   ├── reset-password/      # Password reset form
│   │   │   └── verify-email/        # Email verification
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # AuthContext (global auth state)
│   │   ├── hooks/                   # useAuth, useForm, useSessions
│   │   ├── services/                # API service layer
│   │   └── lib/                     # Axios client with token refresh interceptor
│   └── package.json
│
├── architecture/                    # System design documents
│   ├── ARCHITECTURE.md              # WhatsApp architecture overview
│   └── realtime-chat-architecture.md # Detailed chat system design
├── docs/
│   └── system-architecture.md       # Auth system technical architecture
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js ≥ 18
- MongoDB ≥ 6.0 (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
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

# Create environment file (choose one):
npm run setup:env           # Auto-generates secure JWT secrets (recommended)
# OR
cp env.example .env         # Manual — edit with your values

npm run dev                 # Start on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev                 # Start on http://localhost:3000
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000/api |
| **Swagger Docs** | http://localhost:5000/api-docs |
| **Health Check** | http://localhost:5000/api/health |

---

## 🔑 Environment Variables

### Quick Setup

```bash
cd server
npm run setup:env    # Auto-generates .env with secure random secrets
```

Then edit `.env` to add your MongoDB URI and email credentials.

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | **Yes** |
| `JWT_ACCESS_SECRET` | Access token signing key (auto-generated) | **Yes** |
| `JWT_REFRESH_SECRET` | Refresh token signing key (auto-generated) | **Yes** |
| `SENDGRID_API_KEY` | SendGrid API key for email delivery | Yes* |
| `SENDGRID_FROM_EMAIL` | Verified sender email on SendGrid | Yes* |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP fallback config | Optional |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:3000`) | No |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost (default: `12`) | No |

*\* Required for email functionality. Falls back to SMTP if SendGrid fails. In development, emails are logged to console if neither is configured.*

---

## 📖 API Documentation

### Interactive Documentation (Swagger UI)

Start the server and visit: **http://localhost:5000/api-docs**

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login (returns 2FA challenge if enabled) | No |
| POST | `/api/auth/login-2fa` | Complete 2FA login | No |
| POST | `/api/auth/verify-email` | Verify email token | No |
| POST | `/api/auth/refresh-token` | Refresh access token (via cookie) | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/logout` | Logout current device | Yes |
| POST | `/api/auth/logout-all` | Logout all devices | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| PATCH | `/api/auth/profile` | Update profile | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

### 2FA Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/2fa/secret` | Generate 2FA QR code | Yes |
| POST | `/api/auth/2fa/enable` | Enable 2FA with TOTP token | Yes |
| POST | `/api/auth/2fa/disable` | Disable 2FA (requires password) | Yes |

### Session Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/sessions` | Get all active sessions | Yes |
| DELETE | `/api/sessions/:id` | Revoke specific session | Yes |
| DELETE | `/api/sessions` | Revoke all other sessions | Yes |

---

## 🔄 Authentication Flow

```
  REGISTRATION                           LOGIN
  ══════════                             ═════
  User submits form                      User submits credentials
       │                                      │
       ▼                                      ▼
  Hash password (bcrypt, 12 rounds)      Verify password (bcrypt)
       │                                      │
       ▼                                      ▼
  Save user (unverified)                 Check email verified?
       │                                      │
       ▼                                      ▼
  Generate verification token            Check account locked?
  (SHA-256 hashed in DB, 24h expiry)          │
       │                                      ▼
       ▼                                 2FA enabled? ──Yes──▶ Return 2FA challenge
  Send verification email                     │ No                    │
       │                                      ▼                      ▼
       ▼                                 Create session         User submits TOTP
  User clicks link                       (atomic upsert)              │
       │                                      │                      ▼
       ▼                                      ▼               Verify & create session
  Token consumed atomically              Generate JWT pair            │
  (single-use, findOneAndUpdate)         Access: 15min                ▼
       │                                 Refresh: 7d (HTTP-only)  Return tokens
       ▼                                      │
  User marked as verified                Return to client


  TOKEN REFRESH                          PASSWORD RESET
  ═════════════                          ══════════════
  Access token expires (401)             User requests reset
       │                                      │
       ▼                                      ▼
  Axios interceptor triggers             Generate reset token (1h expiry)
       │                                      │
       ▼                                      ▼
  Send refresh token (from cookie)       Email reset link
  to /refresh-token                           │
       │                                      ▼
       ▼                                 User submits new password
  Validate session + rotate tokens            │
       │                                      ▼
       ▼                                 Token consumed atomically
  Retry failed request                   (single-use)
       │                                      │
       ▼                                      ▼
  Queue concurrent 401s during           Password updated
  refresh (prevent stampede)             passwordChangedAt = now
                                              │
                                              ▼
                                         ALL sessions invalidated
                                         (must re-login everywhere)
```

---

## 🖥 Session Management Strategy

### Device Tracking

Each login creates a session with:
- **Device fingerprint** — MD5 hash of `User-Agent + IP` (prevents duplicate sessions per device)
- **Device info** — Browser name, version, OS, platform, device type (parsed from User-Agent)
- **IP address** — Extracted via `request-ip` middleware
- **Timestamps** — `createdAt`, `lastActiveAt`, `expiresAt`

### Session Lifecycle

```
  LOGIN                    AUTHENTICATED REQUEST          LOGOUT / RESET
  ═════                    ═════════════════════          ══════════════
  Atomic upsert ──────▶ lastActiveAt updated ──────▶ isActive = false
  (per device)             on each request               session count
  within a MongoDB         Session.updateLastActive()    recalculated
  transaction
           │
           ▼
  Refresh token hash
  stored (SHA-256)
           │
           ▼
  Token pair returned
  (access + refresh)
           │
           ▼
  Auto-expired after 7d
  (MongoDB TTL index)
```

### Storage Design

| Feature | Implementation |
|---------|---------------|
| **Uniqueness** | Compound index on `(userId, deviceFingerprint, isActive)` with partial filter |
| **Security** | Refresh token stored as SHA-256 hash (never plain text) |
| **Auto-cleanup** | TTL index on `expiresAt` for automatic expiration |
| **Active count** | `User.activeSessions` updated atomically within transaction |

---

## ⚡ Race Condition Handling

### The Problem

When two login requests from the same device arrive simultaneously:
1. Both check "is there a session?" → Both see "no"
2. Both attempt to create a new session
3. **Result:** Duplicate sessions, corrupted state, inconsistent counts

### The Solution: Four-Layer Defense

```
Layer 1: DATABASE WALL                    Layer 2: ATOMIC OPERATION
══════════════════════                    ═══════════════════════
Unique partial compound index             findOneAndUpdate with upsert:true
on (userId, deviceFingerprint,            "Create OR Update" in one
isActive:true)                            atomic database operation
    │                                         │
    ▼                                         ▼
MongoDB kernel rejects any                If session exists → update it
second write attempt. This is             If not → create it
a HARD WALL against duplication.          No check-then-act race.
    │                                         │
    └─────────────────────────────────────────┘
                        │
                        ▼
Layer 3: ACID TRANSACTION                 Layer 4: ERROR RECOVERY
═════════════════════════                 ═══════════════════════
MongoDB transaction with:                 If E11000 duplicate key error:
  readConcern: 'snapshot'                   → Another request won the race
  writeConcern: 'majority'                  → Find existing session
                                            → Update and return it
All operations (session upsert,              → Graceful recovery
token update, count update)
see consistent snapshot.
Either ALL succeed or NONE.
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Same device, 2 simultaneous logins | One upserts, other updates → single session |
| Different devices, 2 simultaneous logins | Each gets own session (different fingerprint) |
| Transaction failure mid-way | Full rollback, retry with Layer 4 fallback |
| Session count drift | Recalculated atomically within the transaction |

---

## 🛡 Security Practices

| Practice | Implementation |
|----------|---------------|
| **Password Hashing** | bcrypt with 12 salt rounds (~300ms per hash) |
| **Token Storage** | SHA-256 hashed in DB — never stored in plain text |
| **Refresh Token** | HTTP-only, Secure, SameSite cookie (immune to XSS) |
| **Token Rotation** | New refresh token issued on each refresh (detect reuse) |
| **2FA** | TOTP (RFC 6238) via Google Authenticator / Authy |
| **Account Lockout** | 5 failed attempts → 2-hour lock + email notification |
| **Password History** | Rejects last 3 passwords to enforce rotation |
| **Rate Limiting** | Auth: 10/15min, Reset: 5/hour, Verify: 3/hour |
| **Input Validation** | 12 Joi schemas validating all endpoints |
| **Security Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS** | Restricted to frontend origin only |
| **Error Messages** | Generic auth errors prevent user enumeration |
| **Email Enumeration** | Forgot password always returns success message |
| **Session Invalidation** | Password reset → all sessions revoked |
| **Single-Use Tokens** | Verification/reset tokens consumed atomically |

---

## 💬 Chat System Architecture

> **Note:** This is a design-only document. No implementation is required.

The complete WhatsApp-like real-time chat system architecture is documented in the [`architecture/`](./architecture/) folder:

- **[ARCHITECTURE.md](./architecture/ARCHITECTURE.md)** — High-level system overview
- **[realtime-chat-architecture.md](./architecture/realtime-chat-architecture.md)** — Detailed design with:
  - High-level system architecture (API Gateway, WebSocket cluster, message queue)
  - Communication protocol choice (REST vs WebSocket — hybrid approach)
  - Database schema design (MongoDB for users, Cassandra for messages)
  - Message delivery pipeline (sent → delivered → read with offline handling)
  - Presence system (Redis-based with heartbeat + TTL + privacy controls)
  - Multi-device synchronization (event-sourcing-lite approach)
  - Scalability strategy (horizontal scaling with Redis Pub/Sub)
  - Failure handling (circuit breakers, retry logic, dead letter queues)
  - Trade-off decisions (Cassandra vs PostgreSQL, eventual consistency, E2E encryption)

Additionally, the auth system's own architecture is documented in:
- **[docs/system-architecture.md](./docs/system-architecture.md)** — Authentication system security architecture & design decisions

---

## 📬 Email Architecture

The system uses a tiered email delivery strategy:

```
  Email Request
       │
       ▼
  ┌─────────────┐     ┌─────────────────┐
  │  SendGrid   │────▶│  Email Sent ✓   │
  │  (Primary)  │     └─────────────────┘
  └──────┬──────┘
         │ Fails?
         ▼
  ┌─────────────┐     ┌─────────────────┐
  │    SMTP     │────▶│  Email Sent ✓   │
  │  (Fallback) │     └─────────────────┘
  └──────┬──────┘
         │ No SMTP?
         ▼
  ┌─────────────────┐
  │  Console Log    │  (Development only)
  │  (Dev Fallback) │
  └─────────────────┘
```

**Email templates included:** Verification, Password Reset, Security Alert, Account Locked

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ by Srikrishna — as part of the Secure Authentication System internship assignment.*
