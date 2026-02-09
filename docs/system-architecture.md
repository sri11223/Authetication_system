# Secure Authentication System: Architecture & Design Decisions

**System Version:** 1.0.0  
**Document Type:** Technical Architecture & Security Whitepaper

---

## 1. Executive Summary

This is not a traditional authentication system. It is engineered with a "Defense in Depth" philosophy, prioritizing data integrity under high concurrency and resilience against modern attack vectors.

While most systems focus merely on "logging in," this architecture focuses on **session governance**, **race-condition safety**, and **verification assurance**.

---

## 2. Core Security Architecture

Our security model is built on three pillars: **Identity Verification**, **Session Sovereignty**, and **Attack Surface Reduction**.

### 🛡️ Identity Verification: Beyond Passwords
We assume credentials can be compromised. Therefore, we implement:

1.  **Bcrypt Adaptive Hashing**: We use 12 salt rounds, making brute-force attacks computationally expensive (approx. 300ms per hash verification).
2.  **TOTP-based 2FA**: Time-based One-Time Passwords (RFC 6238) add a second factor that rotates every 30 seconds.
3.  **Strict Verification Gates**: Unverified email addresses are strictly quarantined. No access tokens are issued until the email ownership is cryptographically proven via signed tokens.

### 🔐 Session Sovereignty: The Dual-Token Strategy
We reject the insecure practice of storing long-lived JWTs in `localStorage` (vulnerable to XSS). Instead, we use a **Rotation Strategy**:

-   **Access Token (Short-Lived):** 15-minute lifespan. Stored in memory. Used for API authorization.
-   **Refresh Token (Long-Lived):** 7-day lifespan. Stored in an **HTTP-Only, Secure, SameSite=Strict Cookie**.
    -   *Why?* JavaScript cannot read this cookie, neutralizing XSS token theft.
    -   *Rotation:* Every time a refresh token is used, it is invalidated and replaced. If an attacker steals an old refresh token, reuse detection can lock the entire account.

### ⚔️ Attack Surface Reduction
-   **No Information Leakage**: Determining via API whether an email is registered isn't possible (generic messages).
-   **Account Locking**: 5 failed attempts trigger a 2-hour lock, mitigating credential stuffing.
-   **Password History**: Enforce rotation by rejecting the last 3 passwords.

---

## 3. Concurrency & Race Condition Engineering

The most critical engineering achievement in this system is its **Database-Level Concurrency Safety**.

### The Challenge: The "Double-Login" Attack
A user (or attacker) sends two login requests from the same device at the exact same millisecond.
*   **Naive Implementation:** Both requests check "is there a session?", both see "no", both create a new session. Result: Duplicate sessions, corrupted state.

### Our Solution: The Atomic Triad

We solved this using a three-layer approach that makes duplicates mathematically impossible:

**Layer 1: The Unique Compound Index**
We defined a strict rule at the database kernel level:
```javascript
sessionSchema.index(
  { userId: 1, deviceFingerprint: 1, isActive: 1 }, // The Composite Key
  { unique: true, partialFilterExpression: { isActive: true } }
);
```
*Effect:* The database engine itself rejects the second write. It creates a "hard wall" against duplication.

**Layer 2: Atomic Upsert Operations**
We don't do `find()` then `create()`. We do **one** atomic move:
```javascript
findOneAndUpdate(
   { ...criteria },
   { ...updates },
   { upsert: true, new: true } // "Create or Update" in one breath
)
```
*Effect:* This transforms a "check-then-act" race condition into a safe, atomic state transition.

**Layer 3: ACID Transactions**
For operations touching multiple documents (e.g., creating a session AND updating user stats), we wrap everything in a MongoDB Transaction with `snapshot` isolation.
*Effect:* Either everything happens perfectly, or nothing happens at all. Data integrity is absolute.

---

## 4. Architectural Patterns

### 🔄 The Event-Sourcing Inspired Activity Log
Instead of just storing "current state," we store the **history of actions**. Every security-critical event forms an immutable audit trail:
-   *Who* did it? (User ID)
-   *What* happened? (Login, Password Change, Failed 2FA)
-   *When?* (Timestamp)
-   *Where?* (IP, User-Agent, Geo-IP)

This allows us to reconstruct the security story of any account and feed data into the **Security Score Algorithm**.

### 🧩 The Security Score Engine
We gamified security to encourage better user behavior. The `SecurityScore` component isn't just a number; it's a dynamic aggregation of:
-   ✅ 2FA Status (+30 pts)
-   ✅ Email Verification (+25 pts)
-   ✅ Password Freshness (+20 pts)
-   ✅ Session Hygiene (+15 pts)

This transforms abstract security concepts into a tangible metric for users.

---

## 5. Technology Stack Rationale

| Layer | Choice | Rationale for selection |
| :--- | :--- | :--- |
| **Runtime** | **Node.js** | Non-blocking I/O is ideal for high-concurrency auth endpoints. |
| **Framework** | **Express.js** | Minimalist, battle-tested middleware ecosystem (Helmet, Rate-Limit). |
| **Database** | **MongoDB** | Flexible schema for sessions/logs + ACID Transaction support (v4.0+). |
| **Validation** | **Joi** | Declarative schema validation ensures no bad data ever reaches the controller. |
| **Frontend** | **Next.js 14** | Server-side rendering for auth pages + React Server Components security. |
| **Styling** | **Tailwind CSS** | Utility-first architecture allowing for rapid, consistent UI implementation. |

---

## 6. Future Proofing

The system is designed to evolve:
-   **Passkeys Ready:** The session architecture is compatible with WebAuthn/Passkeys integration.
-   **Horizontal Scaling:** Stateless JWT design allows adding multiple backend instances behind a load balancer without "sticky sessions."
-   **Microservice Ready:** The Auth module is decoupled and can be extracted into a standalone service.

---

**Conclusion:**
This system handles authentication not as a "feature" but as critical infrastructure. It prioritizes correctness over convenience and security over simplicity.
