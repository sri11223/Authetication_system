# Real-Time Chat Architecture — A WhatsApp-Scale System Design

> **Document Type:** Architecture Design (No Implementation)  
> **Author:** Srikrishna  
> **Date:** February 2026

---

## Why This Document Exists

This isn't a copy-paste of "how WhatsApp works." It's a ground-up design that wrestles with the *actual hard problems* of building a messaging system — problems that only surface when you think carefully about what happens when things go wrong.

**The deceptively simple question:** "How do you send a message from Alice to Bob?"

**The real question:** "How do you send a message from Alice to Bob when Alice is on a train entering a tunnel, Bob has three devices open, the database server just failed over, and 100 billion other messages are also being sent today?"

---

## Table of Contents

1. [The Architecture at 30,000 Feet](#1-the-architecture-at-30000-feet)
2. [The Protocol Decision: Why WebSockets Win (Mostly)](#2-the-protocol-decision-why-websockets-win-mostly)
3. [Data Modeling: One Size Does NOT Fit All](#3-data-modeling-one-size-does-not-fit-all)
4. [The Life of a Message: From Keystroke to Blue Tick](#4-the-life-of-a-message-from-keystroke-to-blue-tick)
5. [Presence: The Art of Lying (Gracefully)](#5-presence-the-art-of-lying-gracefully)
6. [Multi-Device: The Hardest Problem Nobody Talks About](#6-multi-device-the-hardest-problem-nobody-talks-about)
7. [When Things Break: Designing for Failure](#7-when-things-break-designing-for-failure)
8. [The Trade-offs I Made (And Why)](#8-the-trade-offs-i-made-and-why)

---

## 1. The Architecture at 30,000 Feet

### The Layered View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               CLIENTS                                         │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐                 │
│   │  Mobile   │   │   Web    │   │ Desktop  │   │   IoT    │                 │
│   │   (iOS/   │   │  (React  │   │(Electron)│   │ (Watch/  │                 │
│   │ Android)  │   │   SPA)   │   │          │   │  Tablet) │                 │
│   └─────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘                 │
│         └──────────────┬┴──────────────┴──────────────┘                       │
└────────────────────────┼─────────────────────────────────────────────────────┘
                         │
                  ┌──────▼──────┐
                  │  API GATEWAY │   TLS termination, rate limiting,
                  │  (Layer 7)  │   JWT validation, WS upgrade
                  └──────┬──────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
     │   Auth   │  │WebSocket │  │   Push   │    Three separate scaling
     │ Service  │  │  Server  │  │ Notifier │    domains — each scales
     │  (REST)  │  │ Cluster  │  │(FCM/APNs)│    independently
     └────┬─────┘  └────┬─────┘  └────┬─────┘
          └──────────────┼──────────────┘
                         │
                  ┌──────▼──────┐
                  │  MESSAGE    │    Redis Streams (simpler than Kafka
                  │   BROKER    │    for moderate scale, ordered delivery)
                  └──────┬──────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
     │  User DB │  │  Msg DB  │  │ Presence │
     │ (Mongo)  │  │(Cassandra│  │  Cache   │    Polyglot persistence:
     │ Flexible │  │ write-   │  │ (Redis)  │    right tool for each
     │ schema   │  │ optimized│  │ sub-ms   │    data shape
     └──────────┘  └──────────┘  └──────────┘
```

### Why This Shape?

The key insight: **a chat system is actually three systems in a trench coat.**

| System | Data Pattern | Best Fit |
|--------|-------------|----------|
| **User profiles** | Read-heavy, complex queries, rare updates | MongoDB (flexible docs, rich queries) |
| **Messages** | Write-heavy, append-only, time-range scans | Cassandra (log-structured, partition-key reads) |
| **Presence** | Ultra-high frequency, ephemeral, sub-ms reads | Redis (in-memory, TTL for auto-cleanup) |

Treating these three systems as one (e.g., throwing everything into PostgreSQL) works at 1,000 users. It collapses at 1,000,000.

---

## 2. The Protocol Decision: Why WebSockets Win (Mostly)

### The Problem with REST for Messaging

REST is request-response. Chat is "something happened, let me tell you about it NOW." These are fundamentally different communication models:

| Scenario | REST | WebSocket |
|----------|------|-----------|
| "You have a new message" | Client asks every 2s: "Any messages?" "No." "Any messages?" "No." "Any messages?" "Yes!" | Server pushes immediately when message arrives |
| "Alice is typing..." | Poll every 500ms? Battery dead by lunch. | Trivial: `emit('typing', conversationId)` |
| 100 users online | 100 × 30 polls/minute = 3,000 req/min of wasted work | 100 idle connections, zero wasted work |

### My Hybrid Approach

**WebSocket for real-time flows:**
- Message delivery and status updates
- Typing indicators
- Presence (online/offline/last seen)
- Read receipts

**REST for everything else:**
- Authentication (login, registration)
- Conversation history (paginated)
- Profile updates, contact management
- Media upload via presigned S3 URLs

### Connection Lifecycle

```
Client                                               Server
   │                                                     │
   │───── HTTPS POST /login ────────────────────────────▶│
   │◀──── JWT access + refresh token ───────────────────│
   │                                                     │
   │───── WSS upgrade (JWT in header) ─────────────────▶│   AUTH GATE:
   │◀──── ACK + lastSyncTimestamp ─────────────────────│   JWT verified,
   │                                                     │   session created
   │───── Subscribe to conversation rooms ─────────────▶│
   │◀──── Missed messages since last sync ─────────────│   CATCH-UP:
   │                                                     │   No messages lost
   │◀════ Bidirectional real-time channel ═════════════▶│   during offline
   │                                                     │
   │───── Heartbeat every 30s ─────────────────────────▶│   KEEP-ALIVE:
   │◀──── Pong ────────────────────────────────────────│   presence tracking
```

---

## 3. Data Modeling: One Size Does NOT Fit All

### Users (MongoDB)

Users have complex, nested data that changes rarely. MongoDB's document model maps perfectly:

```javascript
{
  _id: ObjectId("..."),
  phone: "+1234567890",
  name: "Alice",
  profilePicUrl: "https://cdn.../alice.jpg",
  about: "Building things",

  privacy: {
    lastSeenVisibility: "contacts",     // "everyone" | "contacts" | "nobody"
    profilePhotoVisibility: "everyone",
    readReceipts: true
  },

  devices: [
    { deviceId: "uuid-1", platform: "ios", pushToken: "fcm-...", isActive: true },
    { deviceId: "uuid-2", platform: "web", pushToken: null, isActive: true }
  ],

  contacts: [ObjectId("user2"), ObjectId("user3")],
  blockedUsers: [ObjectId("spammer1")]
}
// Index: { phone: 1 }, { "devices.deviceId": 1 }
```

### Conversations (MongoDB)

The conversation list ("chat screen") is the most-viewed screen in any messaging app. We denormalize `lastMessage` here so rendering the list is a single query, not N+1:

```javascript
{
  _id: ObjectId("..."),
  type: "direct",                     // "direct" | "group"

  participants: [
    { userId: ObjectId("alice"), joinedAt: ISODate("..."), isMuted: false },
    { userId: ObjectId("bob"), nickname: "Work Bob", isMuted: false }
  ],

  groupMeta: {                        // null for direct messages
    name: "Project Team",
    description: "Q1 planning",
    avatarUrl: "...",
    createdBy: ObjectId("alice"),
    admins: [ObjectId("alice")]
  },

  lastMessage: {                      // DENORMALIZED — updated on every message
    messageId: "msg-uuid",
    preview: "Hey, are you free tomorrow?",
    senderId: ObjectId("bob"),
    sentAt: ISODate("2026-02-09T11:00:00Z"),
    type: "text"
  }
}
// Index: { "participants.userId": 1, "lastMessage.sentAt": -1 }
```

### Messages (Cassandra)

This is where the data model gets *interesting*. Messages are partitioned by `conversation_id`, so fetching a conversation's history is a **single-partition read** — Cassandra's sweet spot:

```sql
CREATE TABLE messages (
    conversation_id UUID,
    message_id      TIMEUUID,         -- Naturally sorted by time
    sender_id       UUID,

    content_type    TEXT,              -- 'text' | 'image' | 'video' | ...
    content_text    TEXT,
    media_url       TEXT,
    media_thumbnail TEXT,

    reply_to        TIMEUUID,         -- Reply threading
    delivery_status MAP<UUID, TEXT>,   -- { userId: 'sent'|'delivered'|'read' }

    created_at      TIMESTAMP,
    edited_at       TIMESTAMP,
    deleted_at      TIMESTAMP,        -- Soft delete

    PRIMARY KEY ((conversation_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```

**Why TIMEUUID?** It gives us chronological ordering *for free*. No sorting needed, no `ORDER BY` cost, no secondary indexes. The partition key + clustering key do all the work.

### Unread Tracking (Cassandra)

```sql
CREATE TABLE user_conversation_state (
    user_id           UUID,
    conversation_id   UUID,
    last_read_msg_id  TIMEUUID,
    unread_count      INT,
    PRIMARY KEY ((user_id), conversation_id)
);
-- "Give me all conversations with unread messages" = single partition scan
```

---

## 4. The Life of a Message: From Keystroke to Blue Tick

### The Full Pipeline

```
SENDER                          SERVER                           RECEIVER
  │                               │                                │
  │  1. Send via WebSocket        │                                │
  │  (with clientMessageId)       │                                │
  │──────────────────────────────▶│                                │
  │                               │                                │
  │  2. Instant ACK: "sent"  ✓   │                                │
  │◀──────────────────────────────│                                │
  │                               │  3. Persist to Cassandra       │
  │                               │  4. Update conversation state  │
  │                               │  5. Publish to message broker  │
  │                               │          │                     │
  │                               │     ┌────┴────┐                │
  │                               │     │ Online? │                │
  │                               │     └────┬────┘                │
  │                               │    YES   │   NO                │
  │                               │     │    │                     │
  │                               │     │    └─▶ Push notification │
  │                               │     │       via FCM/APNs       │
  │                               │     │                          │
  │                               │     └──────────────────────────▶
  │                               │           6. Deliver via WS    │
  │                               │                                │
  │  7. "delivered" ✓✓            │       Device ACKs receipt      │
  │◀──────────────────────────────│◀───────────────────────────────│
  │                               │                                │
  │                               │          User opens chat       │
  │  8. "read" ✓✓ (blue)         │       Read receipt sent        │
  │◀──────────────────────────────│◀───────────────────────────────│
```

### The Three Ticks

| Status | Visual | Trigger | What It Proves |
|--------|--------|---------|---------------|
| **Sent** | ✓ | Message persisted to DB | Server has it — it won't be lost |
| **Delivered** | ✓✓ | Recipient's device ACKs | It reached their device |
| **Read** | ✓✓ (blue) | Recipient opens conversation | They saw it |

### Edge Cases That Break Simple Implementations

**"What if the receiver is offline?"**
1. Message persists immediately → sender gets ✓
2. Push notification sent → "You have a new message"
3. When receiver opens app → syncs all messages since `lastSyncTimestamp`
4. Device ACKs each message → sender gets ✓✓

**"What if the sender's connection drops mid-send?"**
1. Client generates `clientMessageId` (UUID) *before* sending
2. Client retries with the *same* ID when reconnected
3. Server deduplicates by `clientMessageId` → no double messages
4. This is why you see the ⏳ "clock" icon in WhatsApp — the message is queued locally, waiting for connectivity

**"What about message ordering?"**
- TIMEUUID guarantees chronological ordering within a Cassandra partition
- Network latency can cause out-of-order *delivery* (message B arrives before A)
- **Solution:** Clients sort by server timestamp, not arrival order. Late-arriving messages are inserted at the correct position with a subtle slide animation

---

## 5. Presence: The Art of Lying (Gracefully)

I'm calling this "lying" because real-time presence for millions of users with *strong* consistency would be astronomically expensive. Instead, I design for **eventual consistency with fast convergence** — the status might be 2-3 seconds stale, and that's perfectly fine. Users already expect this.

### Redis-Based Presence Engine

```
┌────────────────────────────────────────────────────────────────┐
│                     REDIS PRESENCE CACHE                        │
│                                                                 │
│  Key: presence:{userId}                                         │
│  Value: { status: "online", deviceId: "...", socketId: "..." } │
│  TTL: 60 seconds (auto-expire = auto-offline)                  │
│                                                                 │
│  Key: lastSeen:{userId}                                         │
│  Value: 1707480000000 (epoch ms)                                │
│  TTL: none (persists until next online)                         │
│                                                                 │
│  Key: user:{userId}:contacts                                    │
│  Value: SET [ contactId1, contactId2, ... ]                     │
│  (Only broadcast presence to relevant users)                   │
└────────────────────────────────────────────────────────────────┘
```

### State Machine

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                    │
│   App opened              Heartbeat every 30s                      │
│     │                         │                                    │
│     ▼                         ▼                                    │
│  ┌──────┐              EXPIRE key 60s                              │
│  │ONLINE│◀──────────── (resets TTL)                                │
│  └──┬───┘                                                          │
│     │                                                              │
│     │ Graceful close?                                              │
│     │                                                              │
│   YES ──▶ DEL key ──▶ SET lastSeen ──▶ Broadcast "offline" ──┐   │
│     │                                                          │   │
│    NO ──▶ (do nothing) ──▶ TTL expires after 60s ─────────────┘   │
│                                                                    │
│                          ┌───────┐                                 │
│                          │OFFLINE│ ──▶ lastSeen saved in Redis     │
│                          └───────┘                                 │
└───────────────────────────────────────────────────────────────────┘
```

### Privacy-Respecting Queries

When User B checks if User A is online:

```javascript
function getPresenceForViewer(targetId, viewerId) {
  const target = await User.findById(targetId);

  // Privacy gate
  if (target.privacy.lastSeenVisibility === 'nobody') return { status: 'hidden' };
  if (target.privacy.lastSeenVisibility === 'contacts') {
    if (!await isContact(targetId, viewerId)) return { status: 'hidden' };
  }

  // Actual presence check
  const presence = await redis.get(`presence:${targetId}`);
  if (presence) return { status: 'online' };

  const lastSeen = await redis.get(`lastSeen:${targetId}`);
  return { status: 'offline', lastSeen };
}
```

---

## 6. Multi-Device: The Hardest Problem Nobody Talks About

When you have WhatsApp Web, Desktop, and two phones — all logged into the same account — here's what needs to happen:

1. A message arrives → delivered to ALL active devices
2. User reads it on Phone → Web and Desktop should also show "read"
3. Desktop was offline → when it reconnects, it needs to catch up

### My Approach: Event Sourcing Lite

Instead of syncing "state" between devices, I sync **events**. Each device maintains its own local state and applies events in order:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                   │
│  │  Phone   │     │   Web    │     │ Desktop  │                   │
│  │ (online) │     │ (online) │     │(offline) │                   │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘                   │
│       │                │                │                          │
│  1. New message arrives for this user                              │
│       │◀───────────────│                │                          │
│       │────────────────▶                │   (Desktop offline,      │
│       │                │                │    events queued)         │
│       │                │                │                          │
│  2. User reads on Phone                 │                          │
│       │── mark_read ──▶│                │                          │
│       │                │ (UI updates)   │                          │
│       │                │                │                          │
│  3. Desktop comes online                │                          │
│       │                │                │── sync(lastEventId) ──▶  │
│       │                │                │◀── queued events[] ────  │
│       │                │                │                          │
│       │                │                │ (applies events,         │
│       │                │                │  shows msg as read)      │
└──────────────────────────────────────────────────────────────────┘
```

### Connection Tracking (Redis)

```javascript
// Each device registers on connect
await redis.hset(`user:${userId}:connections`, deviceId, JSON.stringify({
  socketId: 'socket-xyz',
  connectedAt: Date.now()
}));

// To send a message, broadcast to ALL connected devices
const connections = await redis.hgetall(`user:${userId}:connections`);
for (const [deviceId, info] of Object.entries(connections)) {
  const socket = io.sockets.get(JSON.parse(info).socketId);
  if (socket) socket.emit('message', data);
}
```

### Conflict Resolution

*"What if the user types a message on Web and Phone simultaneously?"*

This is actually a non-problem for chat. Messages are append-only with unique IDs (UUID v4). There's no shared mutable state to conflict on. Display order is determined by the server timestamp, not the client.

---

## 7. When Things Break: Designing for Failure

### Failure Scenarios & Mitigations

| What Breaks | Users Feel | How We Handle It |
|-------------|------------|-----------------|
| **WebSocket pod crashes** | Brief disconnection (1-3s) | Client auto-reconnects to another pod; Redis has session state |
| **Redis primary fails** | "Online" might be stale for 60s | Redis Sentinel auto-promotes replica; TTLs self-heal all presence data |
| **Cassandra node dies** | Slight latency increase | Replication factor = 3; two other nodes serve the data |
| **Message broker backs up** | Delayed delivery (seconds) | Horizontal scaling + DLQ for poison messages |
| **Push notification fails** | No notification, but message still there | Messages are persist-first; user gets them on next app open |
| **Network partition** | Messages show ⏳ clock icon | Client queues locally; retries with same clientMessageId for dedup |

### Circuit Breaker Pattern

When external services (like push notifications) start failing, don't hammer them. Use a circuit breaker:

```
                        failures > 5 in 10s
 ┌────────┐              ┌────────┐
 │ CLOSED │─────────────▶│  OPEN  │  (fail fast for 30s,
 │(normal)│              │        │   don't waste resources)
 └────────┘              └───┬────┘
     ▲                       │ 30s timeout
     │                       ▼
     │                  ┌──────────┐
     └──────────────────│HALF-OPEN │  (try ONE request;
        success         │          │   if it works → close)
                        └──────────┘
```

### Horizontal Scaling

```
┌──────────────────────────────────────────────────────────────────┐
│                    SCALING ARCHITECTURE                            │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │           LOAD BALANCER (Layer 7)                          │    │
│  │      Sticky sessions by hash(userId)                      │    │
│  └───────────────────────┬──────────────────────────────────┘    │
│                          │                                        │
│         ┌────────────────┼────────────────┐                      │
│         ▼                ▼                ▼                      │
│    ┌─────────┐     ┌─────────┐     ┌─────────┐                  │
│    │  WS #1  │     │  WS #2  │     │  WS #N  │  Add pods as    │
│    │ (10K    │     │ (10K    │     │ (10K    │  load increases  │
│    │  conns) │     │  conns) │     │  conns) │                  │
│    └────┬────┘     └────┬────┘     └────┬────┘                  │
│         └────────────────┼────────────────┘                      │
│                          │                                        │
│                  ┌───────▼───────┐                                │
│                  │ REDIS CLUSTER │  Cross-pod message routing     │
│                  │  (Pub/Sub)    │  via Redis Pub/Sub             │
│                  └───────┬───────┘                                │
│                          │                                        │
│         ┌────────────────┼────────────────┐                      │
│         ▼                ▼                ▼                      │
│    ┌──────────┐   ┌──────────┐    ┌──────────┐                  │
│    │Cassandra │◀─▶│Cassandra │◀──▶│Cassandra │  3-node ring    │
│    │  Node 1  │   │  Node 2  │    │  Node 3  │  with RF=3      │
│    └──────────┘   └──────────┘    └──────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. The Trade-offs I Made (And Why)

Every architecture is a set of trade-offs. Here are mine, stated explicitly:

### Cassandra vs PostgreSQL for Messages

| Factor | Cassandra | PostgreSQL |
|--------|-----------|------------|
| Write throughput | Millions/sec (linear scaling) | Thousands/sec (vertical) |
| Read pattern | Partition-key lookups (fast) | Full SQL (flexible but slower at scale) |
| Scaling | Add nodes → linear capacity gain | Read replicas + sharding (complex) |
| Consistency | Tunable (eventual by default) | Strong (ACID) |

**My choice:** Messages are append-only and always queried by `conversation + time range`. This is *exactly* what Cassandra was built for. The trade-off: no JOINs. But we don't need JOINs for message retrieval.

### Eventual Consistency for Presence

Strong consistency for presence would mean: every heartbeat writes to a database with `writeConcern: majority`, and every presence check reads with `readConcern: linearizable`. At scale, this kills performance.

**My choice:** Eventually consistent presence via Redis TTLs. Worst case, someone appears "online" for 60 seconds after closing the app. Nobody has ever complained about this in any messaging app.

### No End-to-End Encryption (In This Version)

E2E encryption (Signal protocol) adds enormous complexity:
- Pre-key management and distribution
- Multi-device key synchronization
- Server can't validate or process message content
- Message search on server becomes impossible

**My choice:** TLS in transit + encryption at rest = secure for an MVP. E2E encryption is a Phase 2 feature that deserves its own architecture document.

### CAP Theorem Position

This system prioritizes **AP (Availability + Partition Tolerance)** over strong Consistency. Reasoning:
- Users expect chat to work even during partial outages
- A 2-second delay in seeing "read" status is acceptable
- A message saying "Network error, try again" is NOT acceptable

---

## Summary

This architecture provides:

| Capability | How |
|-----------|-----|
| **Real-time messaging** | WebSocket with REST fallback |
| **Reliable delivery** | Persist-first model with ✓ ✓✓ ✓✓✓ acknowledgment chain |
| **Multi-device sync** | Event-sourcing-lite with catch-up on reconnect |
| **Polyglot storage** | MongoDB (users) + Cassandra (messages) + Redis (presence) |
| **Fast presence** | Redis TTL + heartbeat + privacy-aware queries |
| **Fault tolerance** | Circuit breakers, retry logic, replication, DLQs |
| **Horizontal scaling** | Stateless WebSocket pods + Redis Pub/Sub + Cassandra ring |

The design is built on one core principle: **messages must never be lost, and users must never wait.** Everything else — consistency, latency, architecture complexity — serves that principle.

---

*This document is part of the Secure Authentication System internship assignment.*
