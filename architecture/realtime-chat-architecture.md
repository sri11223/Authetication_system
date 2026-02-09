# Real-Time Chat Application Architecture
## WhatsApp-Style Messaging System Design

**Author:** Srikrishna  
**Date:** February 2026  
**Document Type:** System Architecture (Design Only)

---

## Table of Contents
1. [Introduction & Problem Statement](#1-introduction--problem-statement)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Communication Protocol Choice](#3-communication-protocol-choice)
4. [Database Schema Design](#4-database-schema-design)
5. [Message Delivery Flow](#5-message-delivery-flow)
6. [Presence System (Online/Offline)](#6-presence-system-onlineoffline)
7. [Multi-Device Synchronization](#7-multi-device-synchronization)
8. [Scalability & Failure Handling](#8-scalability--failure-handling)
9. [Trade-off Decisions](#9-trade-off-decisions)

---

## 1. Introduction & Problem Statement

Building a chat application sounds deceptively simple—until you think about what happens when two users send messages at the *exact same millisecond*, or when someone's phone loses signal mid-message, or when the same user is logged into their phone, tablet, and laptop simultaneously.

**The Real Challenges:**
- Messages must arrive in order, exactly once, and never get lost
- Users should see "typing..." and "online" status with minimal delay
- The system must work even when connectivity is flaky
- Scale matters: WhatsApp handles 100 billion messages per day

This document outlines a practical architecture that addresses these challenges without overengineering.

---

## 2. High-Level System Architecture

### The Bird's Eye View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │ Mobile  │  │   Web   │  │ Desktop │  │   IoT   │                        │
│  │   App   │  │  Client │  │   App   │  │ Device  │                        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘                        │
│       │            │            │            │                              │
└───────┼────────────┼────────────┼────────────┼──────────────────────────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │
                    ┌──────▼──────┐
                    │   API       │  (REST for auth, user management)
                    │   Gateway   │  (WebSocket upgrade for messaging)
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐
   │   Auth  │       │ WebSocket │      │   Push    │
   │ Service │       │  Server   │      │ Notifier  │
   │ (REST)  │       │  Cluster  │      │ (FCM/APNs)│
   └────┬────┘       └─────┬─────┘      └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Message   │  (Pub/Sub message broker)
                    │    Queue    │  (Redis Streams / Kafka)
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌─────▼─────┐
   │  User   │       │  Message  │      │ Presence  │
   │   DB    │       │    DB     │      │   Cache   │
   │(MongoDB)│       │(Cassandra)│      │  (Redis)  │
   └─────────┘       └───────────┘      └───────────┘
```

### Component Breakdown

| Component | Technology Choice | Why This Choice |
|-----------|-------------------|-----------------|
| **API Gateway** | Kong / AWS API Gateway | Rate limiting, auth, WebSocket upgrade routing |
| **Auth Service** | Node.js + JWT | Stateless, horizontally scalable |
| **WebSocket Cluster** | Socket.io + Redis Adapter | Real-time bidirectional, cluster-ready |
| **Message Queue** | Redis Streams | Simpler than Kafka for moderate scale, ordered delivery |
| **User Database** | MongoDB | Flexible schema for user profiles, contacts |
| **Message Database** | Cassandra | Optimized for time-series writes, excellent at scale |
| **Presence Cache** | Redis | Sub-millisecond reads for online/offline status |
| **Push Notifier** | Firebase Cloud Messaging | Reliable delivery to offline devices |

---

## 3. Communication Protocol Choice

### Why Not Just REST?

REST works great for request-response patterns. But chat is fundamentally different:

| Scenario | REST Approach | Problem |
|----------|---------------|---------|
| New message arrives | Client polls every 2 seconds | Battery drain, delayed messages, server load |
| User starts typing | Poll to check typing status? | Impractical, too much latency |
| Online status changes | Poll all contacts? | Doesn't scale |

### The Hybrid Approach

**REST is used for:**
- User registration and authentication
- Fetching conversation history (pagination)
- Profile updates, contact management
- Media upload (presigned S3 URLs)

**WebSocket is used for:**
- Real-time message delivery
- Typing indicators
- Presence updates (online/offline/last seen)
- Read receipts
- Message status updates (sent → delivered → read)

### WebSocket Connection Lifecycle

```
Client                                          Server
   │                                               │
   │──── HTTPS: Login (email, password) ──────────▶│
   │◀─── JWT access token + refresh token ─────────│
   │                                               │
   │──── WSS: Upgrade with JWT in header ─────────▶│
   │◀─── Connection ACK + last sync timestamp ────│
   │                                               │
   │──── Subscribe to rooms (conversations) ──────▶│
   │◀─── Missed messages since last sync ─────────│
   │                                               │
   │◀════ Real-time messages flow both ways ══════▶│
   │                                               │
   │──── Heartbeat every 30 seconds ──────────────▶│
   │◀─── Pong ─────────────────────────────────────│
```

---

## 4. Database Schema Design

### Why Different Databases?

I'm using **MongoDB for users** and **Cassandra for messages**. Here's the thinking:

- **User data**: Read-heavy, rarely changes, complex queries (search by name, filter by status). MongoDB's flexible documents and rich queries fit well.
- **Message data**: Write-heavy, append-only, accessed by time range. Cassandra's log-structured storage and partition keys are perfect for "give me all messages in this conversation after timestamp X."

### User Schema (MongoDB)

```javascript
// users collection
{
  _id: ObjectId("..."),
  phone: "+1234567890",           // Primary identifier
  email: "user@example.com",      // Optional, for recovery
  name: "John Doe",
  profilePicUrl: "https://cdn.../avatar.jpg",
  about: "Available",
  
  // Privacy settings
  privacy: {
    lastSeenVisibility: "contacts",   // "everyone" | "contacts" | "nobody"
    profilePhotoVisibility: "everyone",
    aboutVisibility: "contacts"
  },
  
  // Device tokens for push notifications
  devices: [
    {
      deviceId: "uuid-v4-device-1",
      platform: "ios",
      pushToken: "fcm-token-here",
      lastActiveAt: ISODate("2026-02-09T10:30:00Z"),
      isActive: true
    },
    {
      deviceId: "uuid-v4-device-2",
      platform: "web",
      pushToken: null,   // Web uses WebSocket, no FCM
      lastActiveAt: ISODate("2026-02-09T11:00:00Z"),
      isActive: true
    }
  ],
  
  createdAt: ISODate("2025-01-15T..."),
  updatedAt: ISODate("2026-02-09T...")
}
```

### Conversation Schema (MongoDB)

```javascript
// conversations collection
{
  _id: ObjectId("..."),
  type: "direct",                    // "direct" | "group"
  
  // For direct messages, participants array has exactly 2 users
  participants: [
    {
      userId: ObjectId("user1"),
      joinedAt: ISODate("..."),
      nickname: null,
      isMuted: false,
      mutedUntil: null
    },
    {
      userId: ObjectId("user2"),
      joinedAt: ISODate("..."),
      nickname: "Work Friend",
      isMuted: false,
      mutedUntil: null
    }
  ],
  
  // Group-specific fields
  groupMeta: {
    name: "Project Team",
    description: "Discussion for Q1 project",
    avatarUrl: "https://cdn.../group.jpg",
    createdBy: ObjectId("user1"),
    admins: [ObjectId("user1")]
  },
  
  // Denormalized for quick UI rendering
  lastMessage: {
    messageId: "msg-uuid",
    preview: "Hey, are you free tomorrow?",
    senderId: ObjectId("user2"),
    sentAt: ISODate("2026-02-09T11:00:00Z"),
    type: "text"
  },
  
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}

// Index for efficient queries
// db.conversations.createIndex({ "participants.userId": 1, "lastMessage.sentAt": -1 })
```

### Message Schema (Cassandra)

The key insight here: messages are partitioned by conversation, so fetching a conversation's history is a single partition read (very fast).

```sql
CREATE TABLE messages (
    conversation_id UUID,
    message_id TIMEUUID,           -- Time-based UUID, naturally sorted
    sender_id UUID,
    
    -- Message content (encrypted at rest)
    content_type TEXT,             -- 'text' | 'image' | 'video' | 'document' | 'voice'
    content_text TEXT,             -- For text messages
    media_url TEXT,                -- For media messages
    media_thumbnail_url TEXT,
    media_duration_ms INT,         -- For audio/video
    
    -- Reply threading
    reply_to_message_id TIMEUUID,
    
    -- Delivery tracking (per-recipient for groups)
    delivery_status MAP<UUID, TEXT>,   -- { userId: 'sent' | 'delivered' | 'read' }
    
    -- Timestamps
    created_at TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,          -- Soft delete
    
    PRIMARY KEY ((conversation_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

-- For "unread count" queries: messages after user's last-read timestamp
CREATE TABLE user_conversation_state (
    user_id UUID,
    conversation_id UUID,
    last_read_message_id TIMEUUID,
    unread_count INT,
    is_archived BOOLEAN,
    PRIMARY KEY ((user_id), conversation_id)
);
```

---

## 5. Message Delivery Flow

This is where reliability matters most. Here's my approach using a **transactional outbox pattern**:

### The Journey of a Message

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE DELIVERY PIPELINE                              │
│                                                                               │
│   SENDER                                                          RECEIVER   │
│     │                                                                 │       │
│  1. │─── Send message via WebSocket ────┐                             │       │
│     │                                   │                             │       │
│     │◀── ACK: "sent" ───────────────────┼─────────────────────────────│       │
│     │                                   ▼                             │       │
│     │                          ┌────────────────┐                     │       │
│     │                          │  WebSocket     │                     │       │
│     │                          │  Server        │                     │       │
│     │                          └───────┬────────┘                     │       │
│     │                                  │                              │       │
│  2. │                    ┌─────────────┼─────────────┐                │       │
│     │                    │             │             │                │       │
│     │                    ▼             ▼             ▼                │       │
│     │              ┌──────────┐  ┌──────────┐  ┌──────────┐           │       │
│     │              │ Persist  │  │  Pub to  │  │  Update  │           │       │
│     │              │ Message  │  │  Queue   │  │  Convo   │           │       │
│     │              │   (DB)   │  │ (Redis)  │  │  State   │           │       │
│     │              └──────────┘  └────┬─────┘  └──────────┘           │       │
│     │                                 │                               │       │
│  3. │                   ┌─────────────┴─────────────┐                 │       │
│     │                   │                           │                 │       │
│     │                   ▼                           ▼                 │       │
│     │         ┌─────────────────┐         ┌─────────────────┐         │       │
│     │         │ Online Device?  │   YES   │ Offline Device? │  YES    │       │
│     │         │ (Check Redis)   │────────▶│ (No WebSocket)  │─────────┼───┐   │
│     │         └────────┬────────┘         └────────┬────────┘         │   │   │
│     │                  │ YES                       │ YES              │   │   │
│     │                  ▼                           ▼                  │   │   │
│     │         ┌─────────────────┐         ┌─────────────────┐         │   │   │
│     │         │ Deliver via     │         │ Queue for Push  │         │   │   │
│     │         │ WebSocket       │         │ Notification    │─────────┼───┘   │
│     │         └────────┬────────┘         └─────────────────┘         │       │
│     │                  │                                              │       │
│  4. │                  └──────────────────────────────────────────────▶       │
│     │                           Message delivered                     │       │
│     │                                                                 │       │
│  5. │◀────────────────── ACK: "delivered" ────────────────────────────│       │
│     │                                                                 │       │
│  6. │◀────────────────── ACK: "read" (when user opens chat) ─────────│       │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Status Transitions

| Status | When it Happens | What Sender Sees |
|--------|-----------------|------------------|
| **Sent** (✓) | Message persisted to database | Single grey tick |
| **Delivered** (✓✓) | Message received by recipient's device | Double grey ticks |
| **Read** (✓✓ blue) | Recipient opened the conversation | Double blue ticks |

### Handling Edge Cases

**Q: What if the receiver is offline?**

1. Message is persisted immediately (so sender gets "sent" status)
2. Push notification is sent via FCM/APNs
3. When receiver comes online, they query for messages since `lastSyncTimestamp`
4. Once received, "delivered" ACK is sent back to sender

**Q: What if the sender loses connection mid-send?**

1. Client generates a unique `clientMessageId` before sending
2. Client retries with the same ID when connection restores
3. Server uses this ID for idempotency—duplicate messages are ignored
4. This is why WhatsApp messages sometimes show "clock" icon (pending)

**Q: What about message ordering?**

Cassandra's TIMEUUID guarantees chronological ordering within a partition. But network latency can cause out-of-order delivery. Solution:
- Each message has a `timestamp` from server (authoritative)
- Clients display messages sorted by this timestamp, not arrival order
- If a message arrives "before" an already-displayed message, it's inserted in the correct position with a subtle animation

---

## 6. Presence System (Online/Offline)

The presence system needs to answer one question very fast: **"Is this user online right now?"**

### Design Philosophy

I'm intentionally keeping this *eventually consistent*. Real-time presence for millions of users with strong consistency would be prohibitively expensive. Users understand that "online" status might be a few seconds stale.

### Redis-Based Presence

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENCE CACHE (REDIS)                      │
│                                                                  │
│  Key: presence:{userId}                                          │
│  Value: {                                                        │
│    "status": "online",                                           │
│    "deviceId": "device-uuid",                                    │
│    "socketId": "socket-123",                                     │
│    "lastSeen": 1707480000000                                     │
│  }                                                               │
│  TTL: 60 seconds (auto-expire if no heartbeat)                  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  Key: user:{userId}:contacts                                     │
│  Value: SET [ userId1, userId2, userId3, ... ]                   │
│  (For broadcasting presence changes to relevant users only)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Presence Update Flow

```
1. User opens app
   └─▶ WebSocket connected
       └─▶ SET presence:{userId} with 60s TTL
           └─▶ Broadcast "online" to user's contacts (via Redis Pub/Sub)

2. Every 30 seconds (heartbeat)
   └─▶ EXPIRE presence:{userId} 60
       (Resets TTL, keeps user "online")

3. User closes app (graceful)
   └─▶ DEL presence:{userId}
       └─▶ SET lastSeen:{userId} = current_timestamp
           └─▶ Broadcast "offline" to contacts

4. User's connection drops (ungraceful)
   └─▶ (no action needed)
       └─▶ TTL expires after 60 seconds
           └─▶ Background job broadcasts "offline"
```

### "Last Seen" Privacy

Users can control who sees their last seen time. This is checked at query time:

```javascript
// When user B checks user A's presence
function getPresenceForViewer(targetUserId, viewerUserId) {
  const target = await User.findById(targetUserId);
  
  // Check privacy settings
  if (target.privacy.lastSeenVisibility === 'nobody') {
    return { status: 'hidden', lastSeen: null };
  }
  
  if (target.privacy.lastSeenVisibility === 'contacts') {
    const isContact = await isInContacts(targetUserId, viewerUserId);
    if (!isContact) {
      return { status: 'hidden', lastSeen: null };
    }
  }
  
  // Return actual presence
  const presence = await redis.get(`presence:${targetUserId}`);
  if (presence) {
    return { status: 'online', lastSeen: null };
  }
  
  const lastSeen = await redis.get(`lastSeen:${targetUserId}`);
  return { status: 'offline', lastSeen };
}
```

---

## 7. Multi-Device Synchronization

This is where things get interesting. WhatsApp Web, WhatsApp Desktop, and multiple phones—all need to stay in sync.

### The Core Problem

When a message arrives, it needs to reach ALL of the user's active devices. When a message is read on one device, all other devices should update to show "read" status.

### Sync Strategy: Event Sourcing Lite

Instead of syncing "state," I sync "events." Each device maintains its own local state and applies events in order.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-DEVICE SYNC FLOW                               │
│                                                                              │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐                               │
│   │  Phone  │     │   Web   │     │ Desktop │                               │
│   │ (online)│     │ (online)│     │(offline)│                               │
│   └────┬────┘     └────┬────┘     └────┬────┘                               │
│        │               │               │                                     │
│   1. New message arrives for this user                                       │
│        │               │               │                                     │
│        │◀──────────────┼───────────────│    WebSocket: message_received     │
│        │               │               │                                     │
│        │──────────────▶│               │    (Desktop is offline, queued)    │
│        │               │               │                                     │
│   2. User reads message on Phone                                            │
│        │               │               │                                     │
│        │─── mark_read ─┼──────────────▶│    Sync event: message_read        │
│        │               │               │                                     │
│        │               │◀──────────────│    (Web updates UI)                │
│        │               │               │                                     │
│   3. Desktop comes online                                                    │
│        │               │               │                                     │
│        │               │               │─── sync_request(lastEventId) ─────▶│
│        │               │               │                                     │
│        │               │               │◀── queued_events[] ─────────────────│
│        │               │               │                                     │
│        │               │               │    (Desktop applies events,         │
│        │               │               │     shows message as read)          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Per-Device Connection Tracking

Each WebSocket connection is tagged with a `deviceId`:

```javascript
// When device connects
const connectionInfo = {
  userId: 'user-123',
  deviceId: 'device-abc',
  socketId: 'socket-xyz',
  connectedAt: Date.now()
};

// Store in Redis for routing
await redis.hset(`user:${userId}:connections`, deviceId, JSON.stringify(connectionInfo));

// When sending a message TO this user, broadcast to all their connections
const connections = await redis.hgetall(`user:${userId}:connections`);
for (const [deviceId, info] of Object.entries(connections)) {
  const socket = socketServer.sockets.get(JSON.parse(info).socketId);
  if (socket) {
    socket.emit('message', messageData);
  }
}
```

### Conflict Resolution

What if user types a message on web and phone simultaneously?

- Each message has a unique `messageId` (UUID v4), so duplicates aren't possible
- Display order is determined by server timestamp, not client
- No actual conflicts can occur since messages are append-only

---

## 8. Scalability & Failure Handling

### Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCALING ARCHITECTURE                               │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        LOAD BALANCER (Layer 7)                       │   │
│   │                 (Sticky sessions by userId hash)                     │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                          │
│           ┌───────────────────────┼───────────────────────┐                 │
│           │                       │                       │                 │
│      ┌────▼────┐             ┌────▼────┐             ┌────▼────┐           │
│      │ WS Pod  │             │ WS Pod  │             │ WS Pod  │           │
│      │   #1    │             │   #2    │             │   #3    │           │
│      └────┬────┘             └────┬────┘             └────┬────┘           │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                          │
│                          ┌────────▼────────┐                                │
│                          │  REDIS CLUSTER  │                                │
│                          │  (Pub/Sub for   │                                │
│                          │  cross-pod msg) │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
│      ┌────────────────────────────┼────────────────────────────┐           │
│      │                            │                            │           │
│ ┌────▼─────┐               ┌──────▼──────┐              ┌──────▼─────┐     │
│ │ Cassandra │               │  Cassandra  │              │ Cassandra  │     │
│ │  Node 1   │◀─────────────▶│   Node 2    │◀────────────▶│   Node 3   │     │
│ │ (replica) │               │  (replica)  │              │ (replica)  │     │
│ └───────────┘               └─────────────┘              └────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Failure Scenarios & Mitigations

| Failure | Impact | Mitigation |
|---------|--------|------------|
| **Single WebSocket pod dies** | Users on that pod disconnected | Auto-reconnect to another pod; Redis maintains session state |
| **Redis primary fails** | Presence data temporarily stale | Redis Sentinel auto-promotes replica; 60s TTLs self-heal |
| **Cassandra node fails** | Slight latency increase | Replication factor=3 means 2 other nodes have data |
| **Message queue backlog** | Delayed delivery | Horizontal scaling + dead letter queue for failed messages |
| **Database write fails** | Message not persisted | Retry with exponential backoff; client shows "pending" status |

### Rate Limiting

To prevent abuse and ensure fair usage:

```javascript
// Per-user rate limits
const rateLimits = {
  messages: {
    perMinute: 60,     // 1 message/second average
    perHour: 1000,     // Burst protection
    perDay: 10000      // Spam prevention
  },
  mediaUpload: {
    perMinute: 5,
    perHour: 50,
    maxFileSizeMB: 64
  },
  groupCreate: {
    perHour: 5,
    perDay: 20
  }
};
```

### Circuit Breaker Pattern

When external dependencies (like push notification service) start failing:

```
Normal ──▶ [failures > threshold] ──▶ Open (fail fast for 30s)
   ▲                                         │
   │                                         │
   └──── Closed (reset) ◀── Half-Open ◀─────┘
                           (test with 1 req)
```

---

## 9. Trade-off Decisions

Every architecture involves trade-offs. Here's my reasoning for key decisions:

### Why Cassandra over PostgreSQL for messages?

| Factor | Cassandra | PostgreSQL |
|--------|-----------|------------|
| Write throughput | Excellent (millions/sec) | Good (thousands/sec) |
| Read pattern | Partition-key lookups | Full SQL flexibility |
| Scaling | Linear horizontal | Complex (read replicas, sharding) |
| Consistency | Tunable (eventual default) | Strong |

**Decision:** Messages are append-only, queried by conversation+time range. Cassandra's strengths align perfectly. Trade-off: no JOINs or complex queries (but we don't need them for messages).

### Why separate presence in Redis?

Presence changes are extremely high-frequency (every heartbeat) and need sub-millisecond reads. Putting this in the primary database would create unnecessary load. Redis's in-memory storage and TTL feature are ideal.

### Why not end-to-end encryption in this design?

E2E encryption (like Signal protocol) adds complexity:
- Key exchange on first contact
- Pre-keys management
- Multi-device key sync
- Server can't validate message content

**Trade-off:** For this MVP architecture, TLS in transit + encryption at rest is sufficient. E2E would be a Phase 2 enhancement.

---

## Summary

This architecture provides:

1. **Real-time messaging** via WebSocket with graceful fallback
2. **Reliable delivery** with sent/delivered/read acknowledgments
3. **Multi-device sync** through event-based updates
4. **Scalable storage** using Cassandra for messages, MongoDB for users
5. **Fast presence** via Redis with privacy controls
6. **Fault tolerance** through replication, circuit breakers, and retry logic

The design prioritizes **availability and partition tolerance** (AP in CAP theorem) because users expect chat to work even during partial outages, and slight delays in consistency (seeing "online" a few seconds late) are acceptable.

---

*This document is part of the Secure Authentication System internship assignment.*
