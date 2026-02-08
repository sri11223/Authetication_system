# Real-Time Chat Application Architecture (WhatsApp-like)

> **Note:** This is a design-only document. No implementation is provided.

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Communication Method](#2-communication-method)
3. [Database Schema Design](#3-database-schema-design)
4. [Message Delivery Flow](#4-message-delivery-flow)
5. [Online/Offline Presence Handling](#5-onlineoffline-presence-handling)
6. [Multi-Device Synchronization](#6-multi-device-synchronization)
7. [Scalability & Failure Handling](#7-scalability--failure-handling)

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT DEVICES                                │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│    │  Mobile   │  │  Mobile   │  │  Desktop  │  │   Web    │             │
│    │  (iOS)    │  │ (Android) │  │  Client   │  │  Client  │             │
│    └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘             │
└──────────┼─────────────┼─────────────┼──────────────┼───────────────────┘
           │             │             │              │
           ▼             ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER (Nginx/HAProxy)                    │
│                    (Sticky sessions via user_id hashing)                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  WebSocket    │   │  WebSocket    │   │  WebSocket    │
│  Server #1    │   │  Server #2    │   │  Server #N    │
│  (Node.js)    │   │  (Node.js)    │   │  (Node.js)    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │  Redis   │ │ MongoDB  │ │ Object Store │
        │ Pub/Sub  │ │ Cluster  │ │   (S3/GCS)   │
        │ + Cache  │ │          │ │   for Media   │
        └──────────┘ └──────────┘ └──────────────┘
                            │
                    ┌───────┼───────┐
                    ▼       ▼       ▼
             ┌──────────┐ ┌─────────────┐ ┌────────────────┐
             │ Message  │ │ Notification│ │ Media Processing│
             │ Queue    │ │  Service    │ │   Service       │
             │(RabbitMQ)│ │ (FCM/APNs) │ │ (Thumbnails,    │
             │          │ │            │ │  Compression)    │
             └──────────┘ └─────────────┘ └────────────────┘
```

### Key Components

| Component              | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| **API Gateway**        | REST endpoints for auth, user profiles, contact management   |
| **WebSocket Servers**  | Persistent connections for real-time messaging               |
| **Redis Pub/Sub**      | Cross-server message routing when users are on diff servers  |
| **Redis Cache**        | Online presence, session mapping, recent messages cache      |
| **MongoDB**            | Persistent storage for users, conversations, messages        |
| **Message Queue**      | Async processing of notifications, read receipts, media      |
| **Notification Svc**   | Push notifications via FCM (Android) and APNs (iOS)          |
| **Media Service**      | Upload, compress, thumbnail generation, CDN distribution     |

---

## 2. Communication Method

### Why WebSockets (Not REST)

| Criteria           | REST                     | WebSocket                         |
| ------------------ | ------------------------ | --------------------------------- |
| Latency            | High (request-response)  | Low (persistent connection)       |
| Real-time updates  | Polling required         | Native push support               |
| Server resources   | New conn per request     | Single persistent connection      |
| Bidirectional      | No                       | Yes                               |
| Typing indicators  | Not practical            | Trivial                           |
| Presence updates   | Polling required         | Real-time via heartbeat           |

### Hybrid Approach (Recommended)

- **WebSocket** for: Messages, typing indicators, presence, read receipts, real-time sync
- **REST API** for: Authentication, user profiles, contact management, media upload, conversation history (pagination)

### WebSocket Protocol Design

```
// Client → Server
{ "type": "message.send", "conversationId": "...", "content": "...", "clientMsgId": "uuid" }
{ "type": "message.read", "conversationId": "...", "messageId": "..." }
{ "type": "typing.start", "conversationId": "..." }
{ "type": "typing.stop", "conversationId": "..." }
{ "type": "presence.ping" }

// Server → Client
{ "type": "message.new", "data": { ... } }
{ "type": "message.delivered", "messageId": "...", "timestamp": "..." }
{ "type": "message.read", "messageId": "...", "readBy": "...", "timestamp": "..." }
{ "type": "typing.indicator", "conversationId": "...", "userId": "..." }
{ "type": "presence.update", "userId": "...", "status": "online" }
```

---

## 3. Database Schema Design

### Users Collection

```javascript
{
  _id: ObjectId,
  phoneNumber: String,         // unique, indexed
  name: String,
  avatarUrl: String,
  about: String,               // status message
  lastSeen: Date,
  isOnline: Boolean,
  privacySettings: {
    lastSeen: "everyone" | "contacts" | "nobody",
    profilePhoto: "everyone" | "contacts" | "nobody",
    about: "everyone" | "contacts" | "nobody",
    readReceipts: Boolean
  },
  devices: [{                  // multi-device support
    deviceId: String,
    platform: "ios" | "android" | "web" | "desktop",
    pushToken: String,
    lastActive: Date,
    isActive: Boolean
  }],
  contacts: [ObjectId],        // references to other users
  blockedUsers: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { phoneNumber: 1 }, { "devices.deviceId": 1 }
```

### Conversations Collection

```javascript
{
  _id: ObjectId,
  type: "direct" | "group",
  participants: [{
    userId: ObjectId,
    role: "admin" | "member",    // for groups
    joinedAt: Date,
    lastReadMessageId: ObjectId, // per-user read cursor
    lastReadAt: Date,
    isMuted: Boolean,
    muteExpiry: Date | null
  }],
  // Group-specific fields
  groupMeta: {
    name: String,
    description: String,
    avatarUrl: String,
    createdBy: ObjectId,
    inviteLink: String
  },
  lastMessage: {                 // denormalized for list performance
    messageId: ObjectId,
    content: String,
    senderId: ObjectId,
    timestamp: Date,
    type: String
  },
  unreadCounts: {                // map of userId → unread count
    "userId1": 3,
    "userId2": 0
  },
  createdAt: Date,
  updatedAt: Date
}
// Indexes:
//   { "participants.userId": 1 }
//   { "participants.userId": 1, updatedAt: -1 }  (conversation list query)
```

### Messages Collection

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,      // indexed
  senderId: ObjectId,
  clientMessageId: String,       // client-generated UUID for dedup
  type: "text" | "image" | "video" | "audio" | "document" | "location" | "contact",
  content: {
    text: String,
    mediaUrl: String,
    thumbnailUrl: String,
    mimeType: String,
    fileSize: Number,
    duration: Number,            // audio/video
    location: { lat: Number, lng: Number },
  },
  replyTo: ObjectId,             // reply reference
  deliveryStatus: {
    sent: Date,                  // server received
    deliveredTo: [{
      userId: ObjectId,
      timestamp: Date
    }],
    readBy: [{
      userId: ObjectId,
      timestamp: Date
    }]
  },
  isEdited: Boolean,
  isDeleted: Boolean,            // soft delete (show "message was deleted")
  deletedFor: [ObjectId],        // "delete for me" — per-user
  expiresAt: Date,               // disappearing messages
  createdAt: Date
}
// Indexes:
//   { conversationId: 1, createdAt: -1 }   (message history pagination)
//   { conversationId: 1, senderId: 1 }
//   { clientMessageId: 1 }                  (deduplication)
//   { expiresAt: 1 }                        (TTL for disappearing messages)
```

---

## 4. Message Delivery Flow

### Send → Deliver → Read Pipeline

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│  SENDER  │────▶│  WS SERVER    │────▶│   DATABASE   │────▶│  RECIPIENT   │
│  Device  │     │               │     │              │     │   Device     │
└──────────┘     └───────────────┘     └──────────────┘     └──────────────┘
     │                  │                     │                     │
     │ 1. send msg      │                     │                     │
     │ (clientMsgId)    │                     │                     │
     │─────────────────▶│                     │                     │
     │                  │ 2. validate &       │                     │
     │                  │    persist          │                     │
     │                  │────────────────────▶│                     │
     │                  │                     │                     │
     │ 3. ACK (sent ✓)  │                     │                     │
     │◀─────────────────│                     │                     │
     │                  │                     │                     │
     │                  │ 4. Route to recipient                     │
     │                  │   (direct or via Redis Pub/Sub)           │
     │                  │─────────────────────────────────────────▶│
     │                  │                     │                     │
     │                  │              5. Recipient ACKs delivery   │
     │                  │◀─────────────────────────────────────────│
     │                  │                     │                     │
     │ 6. delivery ✓✓   │                     │                     │
     │◀─────────────────│                     │                     │
     │                  │                     │                     │
     │                  │              7. Recipient opens chat      │
     │                  │              8. Read receipt sent         │
     │                  │◀─────────────────────────────────────────│
     │                  │                     │                     │
     │ 9. read ✓✓✓      │                     │                     │
     │◀─────────────────│                     │                     │
```

### Status Transitions

| Status        | Symbol | Trigger                           |
| ------------- | ------ | --------------------------------- |
| **Sent**      | ✓      | Server persists message to DB     |
| **Delivered** | ✓✓     | Recipient's device ACKs receipt   |
| **Read**      | ✓✓✓    | Recipient opens the conversation  |

### Offline Delivery

1. Message is persisted to MongoDB regardless of recipient's online status
2. If recipient is **offline**, message is queued and a **push notification** is sent via FCM/APNs
3. When recipient comes online, they:
   - Reconnect via WebSocket
   - Server sends all pending messages since `lastSeen` timestamp
   - Client ACKs each delivered message → delivery receipts sent back to sender

---

## 5. Online/Offline Presence Handling

### Architecture

```
┌──────────┐    heartbeat     ┌───────────────┐    pub/sub    ┌──────────┐
│  Client  │ ──────────────▶  │  WS Server    │ ────────────▶ │  Redis   │
│          │   every 30s      │               │               │          │
└──────────┘                  └───────────────┘               └──────────┘
                                     │
                                     │ presence change event
                                     ▼
                              ┌───────────────┐
                              │  Broadcast to │
                              │  contacts     │
                              └───────────────┘
```

### Mechanism

1. **Heartbeat**: Client sends a ping every 30 seconds over WebSocket
2. **Redis TTL**: Each heartbeat sets a Redis key with 60s TTL:
   ```
   SET presence:{userId} "online" EX 60
   ```
3. **Offline Detection**: When TTL expires (no heartbeat for 60s), user is marked offline
4. **Last Seen**: Updated in DB when user transitions from online → offline
5. **Privacy Respecting**: Presence is only shared based on `privacySettings.lastSeen`

### State Machine

```
                    ┌─────────┐
     connect ──────▶│ ONLINE  │◀──── heartbeat received
                    └────┬────┘
                         │
              no heartbeat for 60s
                         │
                    ┌────▼────┐
                    │ OFFLINE │──── update lastSeen in DB
                    └─────────┘
```

---

## 6. Multi-Device Synchronization

### Strategy: Fan-Out on Write

When a message is sent, it is delivered to **all active devices** of the recipient simultaneously.

```
                    ┌──────────────────────────┐
                    │     Message Router        │
                    │                          │
                    │  Lookup: recipient has    │
                    │  3 active devices         │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  Phone   │    │  Tablet  │    │  Web     │
        │  (WS #1) │    │  (WS #2) │    │  (WS #1) │
        └──────────┘    └──────────┘    └──────────┘
```

### Synchronization Rules

1. **Device Registry**: Each device registers with a unique `deviceId` on connection
2. **Message Delivery**: Messages are fanned out to all connected devices via Redis Pub/Sub
3. **Read State Sync**: When one device reads a message, a sync event is sent to other devices:
   ```json
   { "type": "sync.read", "conversationId": "...", "lastReadMessageId": "..." }
   ```
4. **Draft Sync**: Typing drafts can be synced across devices (optional, like Telegram)
5. **Conflict Resolution**: Server timestamp is authoritative — last-write-wins for state changes
6. **Offline Sync**: On reconnection, device fetches diff since `lastSyncTimestamp`:
   ```
   GET /api/sync?since=2025-01-15T10:30:00Z&deviceId=abc123
   ```

---

## 7. Scalability & Failure Handling

### Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        SCALING LAYERS                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Layer 1: WebSocket Servers (Stateless + Redis Pub/Sub)  │   │
│  │ Scale: Add more instances behind load balancer          │   │
│  │ Strategy: Consistent hashing by userId                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Layer 2: Redis Cluster (Presence + Pub/Sub + Cache)     │   │
│  │ Scale: Redis Cluster with sharding                      │   │
│  │ Strategy: Hash slots across nodes                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Layer 3: MongoDB (Persistent Storage)                   │   │
│  │ Scale: Sharding by conversationId                       │   │
│  │ Strategy: Range-based sharding for time-series queries  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Layer 4: Message Queue (Async Processing)               │   │
│  │ Scale: Add consumers for notifications, media, etc.     │   │
│  │ Strategy: Topic-based partitioning                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Failure Scenarios & Mitigations

| Scenario                         | Mitigation Strategy                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **WebSocket server crash**       | Client auto-reconnects to another server. Pending messages fetched from DB on reconnect.                   |
| **Redis node failure**           | Redis Sentinel / Cluster with automatic failover. Presence data rebuilds from WS connections.              |
| **MongoDB primary failure**      | Replica set with automatic election. Write concern `majority` ensures durability.                          |
| **Message queue failure**        | Dead letter queue (DLQ) for failed jobs. Retry with exponential backoff. Persistent queue storage.         |
| **Network partition**            | Client-side message queuing. Messages retry on reconnect. `clientMessageId` prevents duplicates.           |
| **Message delivery failure**     | Persistent storage first, then delivery. Undelivered messages retried on next connection.                  |
| **Media upload failure**         | Resumable uploads (tus protocol). Client retries with same upload ID.                                      |
| **Notification service failure** | Queue-based with retries. Fallback: messages delivered on next app open.                                   |

### Performance Optimizations

1. **Connection Pooling**: Each WS server maintains a pool of MongoDB and Redis connections
2. **Message Batching**: Group multiple small messages into batches for DB writes
3. **Read-Through Cache**: Recent messages cached in Redis with LRU eviction
4. **Lazy Loading**: Conversation list only loads last message + unread count (denormalized)
5. **Pagination**: Message history uses cursor-based pagination (not offset)
6. **CDN**: Media files served through CDN with signed URLs
7. **Compression**: WebSocket messages compressed with `permessage-deflate`
8. **Database Indexing**: Compound indexes on hot query paths (see schema section)

### Monitoring & Observability

- **Metrics**: Prometheus + Grafana for WebSocket connections, message throughput, latency P50/P95/P99
- **Logging**: Structured JSON logs with correlation IDs per message flow
- **Tracing**: Distributed tracing (Jaeger/Zipkin) for message delivery pipeline
- **Alerting**: PagerDuty/OpsGenie alerts on connection drops, delivery failures, queue depth

---

## Summary

This architecture prioritizes:

- **Low Latency**: WebSocket-first with REST fallback
- **Reliability**: Persist-first delivery model with queue-based async processing
- **Scalability**: Stateless WebSocket servers + Redis Pub/Sub for cross-server routing
- **Consistency**: MongoDB transactions for group operations, `clientMessageId` for dedup
- **Multi-Device**: Fan-out on write with sync events across all active devices
- **Resilience**: Auto-reconnect, retry logic, dead letter queues, and graceful degradation
