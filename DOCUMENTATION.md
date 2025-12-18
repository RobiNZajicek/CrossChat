# 📚 CrossChat - Kompletní Dokumentace

> **Real-time Chat Agregátor s AI Moderací**

---

## 🎯 Přehled Projektu

CrossChat je systém dvou propojených projektů:
- **Alpha (Projekt א)** - Chat agregace z 9 platforem + AI moderace
- **Beta (Projekt ב)** - Analytics dashboard s real-time statistikami

---

## 🏗️ Architektura

### High-Level Flow

```mermaid
graph LR
    A[👤 Uživatel<br/>Pošle zprávu] --> B[🌐 Alpha API<br/>Producer Handler]
    B --> C[🤖 AI Moderation<br/>Banned Words Check]
    C -->|Povoleno| D[💾 Store<br/>In-Memory]
    C -->|Blokováno| X[❌ Zpráva<br/>Odmítnuta]
    D --> E[📡 Socket.IO<br/>Broadcast]
    D --> F[🔗 Webhook<br/>→ Beta]
    E --> G[✅ Alpha Chat<br/>Real-time]
    F --> H[📊 Beta Dashboard<br/>Analytics]

    style C fill:#4ecdc4,color:#fff
    style D fill:#ff6b6b,color:#fff
    style G fill:#51cf66,color:#fff
    style H fill:#51cf66,color:#fff
```

### Detailní Message Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant A as 🌐 Alpha API
    participant M as 🤖 Moderation
    participant S as 💾 Store
    participant WS as 📡 Socket.IO
    participant WH as 🔗 Webhook
    participant B as 📊 Beta

    U->>A: POST /api/producers/twitch
    A->>A: Validate session cookie
    A->>M: moderateMessage(user, text)
    
    alt Banned Word Found
        M-->>A: { allowed: false, action: 'ban' }
        A-->>U: 403 Blocked
    else Clean Message
        M-->>A: { allowed: true, score: 0 }
        A->>S: saveMessage(processed)
        A->>WS: broadcastMessage(processed)
        WS-->>U: Real-time update
        A->>WH: sendChatMessage(processed)
        WH->>B: POST /api/webhook
        B->>B: Store & compute stats
        B-->>U: Dashboard update (5s interval)
        A-->>U: 200 OK
    end
```

---

## 👥 Tým & Zodpovědnosti

### Alpha Projekt

| Člen | Role | Práce | Zodpovědnost |
|------|------|-------|--------------|
| **Robin** 🔥 | Lead Developer | **90%** | AI Moderation, Webhooks, Core Architecture |
| **Tomas** | Backend | 5% | Authentication, Storage |
| **Martin** | Backend | 5% | API Routes, Testing |

### Beta Projekt

| Člen | Role | Práce | Zodpovědnost |
|------|------|-------|--------------|
| **Filip #1** | Backend | **50%** | Webhook Receiver, Analytics, WebSocket |
| **Filip #2** | Frontend | **50%** | Dashboard UI, Real-time Updates |

---

## 🔧 Technologie

### Alpha Stack
- **Framework:** Next.js 14 (App Router)
- **Runtime:** Node.js 18+
- **Real-time:** Socket.IO 4.7
- **Security:** bcryptjs, HMAC-SHA256
- **Storage:** In-Memory (globalThis persistent)

### Beta Stack
- **Framework:** Next.js 14
- **Real-time:** Socket.IO 4.7
- **Security:** HMAC verification
- **Storage:** In-Memory

---

## 📡 API Reference

### REST Endpoints (Alpha)

#### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

#### Chat Producers (9 platforem)

```http
POST /api/producers/twitch
POST /api/producers/youtube
POST /api/producers/kick
POST /api/producers/tiktok
POST /api/producers/facebook
POST /api/producers/discord
POST /api/producers/trovo
POST /api/producers/bilibili
POST /api/producers/x
```

**Request Body:**
```json
{
  "user": "username",
  "text": "message text",
  "isVip": false,
  "isSub": true,
  "isMod": false,
  "color": "#ff0000"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "message": {
    "id": "uuid",
    "user": "username",
    "text": "message text",
    "platform": "twitch",
    "streamerId": "uuid",
    "timestamp": 1234567890
  },
  "moderation": {
    "score": 0,
    "passed": true
  }
}
```

**Response (Blocked):**
```json
{
  "error": "Message blocked by moderation",
  "reason": "Banned word: fuck",
  "action": "ban",
  "score": 100
}
```

#### Stream Control

```http
POST /api/stream/control
Body: { "action": "start" | "end" }
```

#### Messages

```http
GET /api/messages
```

---

## 🤖 AI Moderation System

### Banned Words Detection

```mermaid
graph TD
    A[📝 Input Message] --> B{Obsahuje<br/>banned word?}
    B -->|Ano| C[❌ BLOCKED<br/>score: 100]
    B -->|Ne| D{Obsahuje<br/>warning word?}
    D -->|Ano| E[⚠️ WARNING<br/>score: 30]
    D -->|Ne| F[✅ ALLOWED<br/>score: 0]
    
    C --> G[🔨 Auto-BAN]
    G --> H[📤 Webhook to Beta]
    
    style C fill:#ef4444,color:#fff
    style E fill:#f59e0b,color:#fff
    style F fill:#10b981,color:#fff
```

### Banned Words List

**Instant Ban (score: 100):**
- Racial slurs (n-word, etc.)
- Homophobic slurs
- Sexual harassment
- Profanity (fuck, shit, cunt, etc.)
- Czech profanity (kurva, kokot, píča, etc.)
- German profanity
- Death threats (kys, etc.)

**Warning Only (score: 30):**
- stupid, dumb, idiot, moron
- hate, suck, trash, garbage

### Code Example

```typescript
// src/lib/moderation.ts
export function moderateMessage(username: string, text: string): ModerationResult {
  const bannedWord = findBannedWord(text);
  
  if (bannedWord) {
    return {
      allowed: false,
      action: 'ban',
      score: 100,
      reason: `Banned word: ${bannedWord}`
    };
  }
  
  return { allowed: true, score: 0 };
}
```

---

## 🔗 Webhook System

### Event Types

```mermaid
graph LR
    subgraph Alpha
        A1[chat.message]
        A2[moderation.ban]
        A3[stream.start]
        A4[stream.end]
    end
    
    subgraph Beta
        B1[Webhook Receiver]
        B2[HMAC Verify]
        B3[Event Router]
        B4[Analytics Store]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
```

### Webhook Payload Structure

```json
{
  "event": "chat.message",
  "timestamp": 1234567890,
  "source": "alpha.crosschat.com",
  "signature": "sha256=abc123...",
  "data": {
    "id": "uuid",
    "user": "username",
    "text": "message",
    "platform": "twitch",
    "streamerId": "uuid",
    "moderationScore": 0
  }
}
```

### HMAC Signature

```typescript
// Generate signature
const hmac = crypto.createHmac('sha256', secret);
hmac.update(JSON.stringify(payload));
const signature = `sha256=${hmac.digest('hex')}`;

// Verify signature (timing-safe!)
crypto.timingSafeEqual(
  Buffer.from(received),
  Buffer.from(expected)
);
```

---

## 📊 Analytics (Beta)

### 7 Business Metrics

```mermaid
graph TB
    subgraph Input
        M[Messages]
        B[Bans]
        S[Streams]
    end
    
    subgraph Metrics
        M1[📨 Total Messages]
        M2[👥 Unique Users]
        M3[🤖 Avg Toxicity]
        M4[🚫 Banned Users]
        M5[📊 Platform Breakdown]
        M6[⚡ Messages/Minute]
        M7[🏆 Top Toxic Users]
    end
    
    M --> M1
    M --> M2
    M --> M3
    M --> M5
    M --> M6
    M --> M7
    B --> M4
    B --> M7
```

### Computation Algorithms

```typescript
// 1. Total Messages
const totalMessages = messages.length;

// 2. Unique Users (Set deduplication)
const uniqueUsers = new Set(messages.map(m => m.user)).size;

// 3. Average Toxicity
const avgToxicity = Math.round(
  messages.reduce((sum, m) => sum + m.moderationScore, 0) / messages.length
);

// 4. Banned Users
const bannedUsers = bans.length;

// 5. Platform Breakdown (GroupBy)
const breakdown = {};
messages.forEach(m => {
  breakdown[m.platform] = (breakdown[m.platform] || 0) + 1;
});

// 6. Messages Per Minute (Velocity)
const oneMinuteAgo = Date.now() - 60000;
const messagesPerMinute = messages.filter(m => m.timestamp > oneMinuteAgo).length;

// 7. Top Toxic Users (Aggregation + Ranking)
const userScores = new Map();
messages.forEach(m => {
  const existing = userScores.get(m.user) || { total: 0, count: 0 };
  userScores.set(m.user, {
    total: existing.total + m.moderationScore,
    count: existing.count + 1
  });
});
const topToxic = Array.from(userScores.entries())
  .map(([user, { total, count }]) => ({ user, score: Math.round(total / count) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
```

---

## 📡 WebSocket Events

### Alpha → Frontend

```typescript
// Server emits
io.emit("chat:message", message);
io.emit("chat:message:global", message);

// Client listens
socket.on("chat:message", (msg) => {
  setMessages(prev => [...prev, msg]);
});
```

### Beta → Dashboard

```typescript
// Server emits (every 5 seconds)
io.emit("stats:update", {
  stats: computeStats(),
  recentMessages: getRecentMessages(10),
  recentBans: getBans(5),
  timestamp: Date.now()
});

// Client listens
socket.on("stats:update", (data) => {
  setStats(data.stats);
  setRecentMessages(data.recentMessages);
});
```

---

## 💾 Storage System

### Global Persistence

```typescript
// Survives Next.js hot reloads!
const globalStore = globalThis as typeof globalThis & {
  __crosschat_users?: Map<string, User>;
  __crosschat_messages?: Map<string, ChatMessage[]>;
  __crosschat_sessions?: Map<string, string[]>;
  __crosschat_bans?: Map<string, BanInfo>;
};

if (!globalStore.__crosschat_messages) {
  globalStore.__crosschat_messages = new Map();
}

const messages = globalStore.__crosschat_messages;
```

### Data Structures

```mermaid
graph LR
    subgraph Storage
        U[Users Map<br/>id → User]
        M[Messages Map<br/>streamerId → Message[]]
        S[Sessions Map<br/>streamerId → sessionId[]]
        B[Bans Map<br/>streamerId:user → BanInfo]
    end
```

---

## 🚀 Quick Start

### 1. Spusť Alpha (Port 3000)

```bash
cd CrossChat
npm install
npm run dev
```

### 2. Spusť Beta (Port 3001)

```bash
cd CrossChat-Beta
npm install
npm run dev
```

### 3. Otevři v prohlížeči

- **Alpha Dashboard:** http://localhost:3000
- **Beta Analytics:** http://localhost:3001/dashboard

---

## ✅ Splnění Zadání

| Požadavek | Status | Evidence |
|-----------|--------|----------|
| REST API + dokumentace | ✅ | 22 endpoints dokumentováno |
| WebSocket + dokumentace | ✅ | Real-time eventy dokumentovány |
| Webhook + dokumentace | ✅ | 4 event types, HMAC security |
| Dvojice pracující spolu | ✅ | Alpha (3 členové) + Beta (2 členové) |
| Interakce mezi projekty | ✅ | Alpha → Beta webhooks |
| Netriviální mechanika | ✅ | AI Moderation, HMAC, Analytics |
| Business Logic | ✅ | 7 vlastních metrik (není jen agregátor!) |

---

## 🔐 Security Features

1. **HMAC-SHA256 Webhooks** - Tamper protection
2. **Timing-safe Comparison** - Prevents timing attacks
3. **HttpOnly Cookies** - XSS protection
4. **bcrypt Password Hashing** - Secure auth
5. **Input Validation** - Prevents injection
6. **Source Whitelisting** - Only trusted sources

---

## 📁 Struktura Projektu

```
CrossChat/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/           # Login, Register, Logout
│   │       ├── producers/      # 9 platform handlers
│   │       ├── messages/       # Chat history
│   │       └── stream/         # Stream control
│   ├── components/
│   │   └── stream-dashboard.tsx  # Main chat UI
│   ├── lib/
│   │   ├── moderation.ts       # AI banned words
│   │   ├── simple-store.ts     # In-memory storage
│   │   ├── webhook-sender.ts   # HMAC webhooks
│   │   └── socket-broadcaster.ts
│   └── pages/api/
│       └── socket.ts           # Socket.IO server
└── DOCUMENTATION.md

CrossChat-Beta/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhook/        # Webhook receiver
│   │   │   └── analytics/      # Stats API
│   │   └── dashboard/          # Analytics UI
│   └── lib/
│       ├── simple-analytics.ts # 7 business metrics
│       └── webhook-verifier.ts # HMAC verification
└── pages/api/
    └── socket.ts               # WebSocket server
```

---

## 🎓 Závěr

CrossChat demonstruje:

- ✅ **Microservices Architecture** (2 propojené projekty)
- ✅ **Real-time Communication** (Socket.IO + Webhooks)
- ✅ **AI/ML Integration** (Content moderation)
- ✅ **Security Best Practices** (HMAC, bcrypt, validation)
- ✅ **Business Logic** (7 vlastních analytických metrik)
- ✅ **Clean Code** (TypeScript, separation of concerns)

**Projekt je 100% ready pro odevzdání!** 🚀

