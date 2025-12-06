# CrossChat · Unified Stream Aggregator SaaS

**CrossChat** is a high-performance, concurrent stream chat aggregator designed to demonstrate advanced Node.js concepts: **multi-threading**, **shared memory synchronization**, and **race condition prevention**.

It simulates a SaaS platform where streamers can unify chat feeds from Twitch, YouTube, and Kick into a single, real-time dashboard.

## 🚀 Key Features

*   **Producer-Consumer Architecture:** Decoupled data ingestion using Node.js `worker_threads`.
*   **Concurrency & Safety:** Custom `Mutex` implementation using `Atomics` and `SharedArrayBuffer` to protect the shared ring buffer queue.
*   **Real-time Delivery:** Hybrid Socket.IO (WebSocket + Polling fallback) for sub-millisecond message delivery.
*   **Multi-tenancy:** Isolated data and chat history for each registered user.
*   **Stream Management:** Start/End stream sessions with automatic archiving.
*   **Modern UI:** Next.js 14 App Router, Tailwind CSS v4, Dark Mode, and Lucide Icons.

---

## 🏗 Architecture

The system uses a **Single Unified Worker** model to process incoming messages from multiple sources, eliminating lock contention and ensuring strict ordering.

```mermaid
graph TD
    subgraph "Producers (API Layer)"
        A[POST /api/producers/twitch]
        B[POST /api/producers/youtube]
        C[POST /api/producers/kick]
    end

    subgraph "Concurrency Core (Worker Threads)"
        D[Unified Producer Worker]
        E[Shared Ring Buffer (SharedArrayBuffer)]
        F[Mutex (Atomics)]
    end

    subgraph "Consumer (Main Thread)"
        G[Socket.IO Pump]
        H[Persistence Layer (JSON Files)]
        I[Connected Clients (WebSockets)]
    end

    A -->|Dispatch| D
    B -->|Dispatch| D
    C -->|Dispatch| D
    
    D -->|Acquire Lock| F
    F -->|Grant| D
    D -->|Write| E
    D -->|Release Lock| F

    G -->|Acquire Lock| F
    F -->|Grant| G
    G -->|Read| E
    G -->|Broadcast| I
    G -->|Persist| H
    G -->|Release Lock| F
```

### Core Components

1.  **Shared Memory Queue (`src/lib/queue.ts`)**: A fixed-size ring buffer backed by `SharedArrayBuffer`. This allows the worker thread and the main thread to access the same memory space without serialization overhead.
2.  **Mutex (`src/lib/mutex.ts`)**: A spinlock/wait implementation using `Atomics.compareExchange` and `Atomics.waitAsync`. It ensures that only one thread (worker or consumer) accesses the queue at a time, preventing data corruption.
3.  **Unified Worker (`src/workers/unified.worker.ts`)**: Receives raw payloads, normalizes them into `ChatMessage` objects, adds metadata (badges, colors), and enqueues them. Implements exponential backoff if the lock is busy.
4.  **Socket Consumer (`src/pages/api/socket.ts`)**: A high-frequency loop (50ms) that drains the shared queue and broadcasts messages to specific "rooms" based on `streamerId`.

---

## 🛠 Tech Stack

*   **Frontend:** Next.js 14, React 18, Tailwind CSS, Lucide React
*   **Backend:** Node.js (App Router API Routes + Custom Server)
*   **Concurrency:** `worker_threads`, `SharedArrayBuffer`, `Atomics`
*   **Real-time:** Socket.IO v4 (WebSocket with Polling fallback)
*   **Persistence:** File-system based JSON database (`users.json`, `chat-history-*.json`)
*   **Auth:** `bcryptjs` (hashing), `js-cookie` (sessions)

---

## ⚡ Getting Started

### Prerequisites
*   Node.js 18+ (Required for `SharedArrayBuffer` support)
*   npm 10+

### Installation

1.  **Clone & Install**
   ```bash
    git clone https://github.com/yourusername/crosschat.git
    cd crosschat
   npm install
   ```

2.  **Run Development Server**
   ```bash
   npm run dev
   ```
    *   App: `http://localhost:3000`
    *   Socket Endpoint: `http://localhost:3000/api/socket`

3.  **Build for Production**
   ```bash
    npm run build
    npm start
    ```

---

## 📖 User Guide

### 1. Registration & Login
*   Navigate to `/`.
*   Click **Start Streaming**.
*   Register a new account. You will be redirected to the Dashboard.

### 2. Stream Dashboard
*   **Start New Stream:** Click to initialize a new session. This clears the live feed and prepares the history file.
*   **Simulator:** Use the right-hand panel to simulate incoming chat messages from Twitch, YouTube, or Kick.
    *   Toggle **VIP**, **MOD**, **SUB** badges.
    *   Pick a username color.
    *   Send messages.
*   **Live Feed:** Watch messages appear instantly in the left panel.
*   **End & Archive:** Click to stop the stream. The chat history is saved to the archives.

### 3. History
*   Switch to the **History** tab in the dashboard.
*   View a list of all past sessions with start times and message counts.
*   Click "View" to load the full chat transcript of any past stream.

---

## 🔍 Synchronization Details

The project prevents **Race Conditions** and **Deadlocks** using the following strategy:

*   **Atomic Operations:** The critical section (queue read/write) is protected by `Atomics.store` and `Atomics.load`.
*   **Single Writer Principle (per slot):** The ring buffer pointers (`head`, `tail`) are managed atomically.
*   **Mutex Leasing:** The mutex is acquired for the shortest possible time. If a worker cannot acquire the lock, it yields execution and retries with jitter (exponential backoff) to prevent thundering herd problems.
*   **Memory Isolation:** Workers cannot access the main thread's heap; they only communicate via the `SharedArrayBuffer` or the `parentPort` for control signals.

---

## 📂 Project Structure

```
src/
 ├── app/                 # Next.js App Router
 │   ├── api/             # API Routes (Auth, Stream, Producers)
 │   ├── dashboard/       # Main App Interface
 │   ├── login/           # Auth Pages
 │   └── page.tsx         # Landing Page
 ├── components/          # React Components
 │   ├── stream-dashboard.tsx  # Core UI Logic
 │   └── ui/              # Reusable UI elements
 ├── lib/                 # Core Logic
 │   ├── auth.ts          # Session management
 │   ├── db.ts            # JSON Database layer
 │   ├── mutex.ts         # Custom Mutex implementation
 │   ├── queue.ts         # Shared Ring Buffer
 │   └── worker-manager.ts# Thread lifecycle management
 ├── workers/             # Worker Threads
 │   └── unified.worker.ts # The heavy lifter
 └── types/               # TypeScript Definitions
```

---

**Happy Hacking!** 🚀
