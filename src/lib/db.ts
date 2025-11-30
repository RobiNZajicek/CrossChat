import fs from "node:fs";
import path from "node:path";
import { type ChatMessage } from "@/types/chat";

const USERS_FILE = path.join(process.cwd(), "users.json");

export type StreamSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  messagesFile: string; // Filename of the archived chat
};

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  activeSessionId?: string; // Currently active stream
  sessions: StreamSession[];
};

// --- User Management ---

export function getUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data) as User[];
    }
  } catch (error) {
    console.error("Failed to load users:", error);
  }
  return [];
}

export function saveUser(user: User) {
  const users = getUsers();
  // Update if exists, else push
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

// --- Session Management ---

export function startNewSession(userId: string): StreamSession {
  const user = findUserById(userId);
  if (!user) throw new Error("User not found");

  // End existing session if any
  if (user.activeSessionId) {
    endSession(userId);
  }

  const newSession: StreamSession = {
    id: `session-${Date.now()}`,
    startedAt: Date.now(),
    messageCount: 0,
    messagesFile: `chat-history-${userId}.json` // Default active file
  };

  user.activeSessionId = newSession.id;
  user.sessions = user.sessions || [];
  user.sessions.push(newSession); // Track it
  
  // Clear active chat file
  const activeFile = path.join(process.cwd(), newSession.messagesFile);
  if (fs.existsSync(activeFile)) {
    fs.unlinkSync(activeFile);
  }

  saveUser(user);
  return newSession;
}

export function endSession(userId: string) {
  const user = findUserById(userId);
  if (!user || !user.activeSessionId) return;

  const session = user.sessions.find(s => s.id === user.activeSessionId);
  if (session) {
    session.endedAt = Date.now();
    
    // Rename/Archive the file
    const activeFile = path.join(process.cwd(), `chat-history-${userId}.json`);
    const archiveFile = `archive-${userId}-${session.id}.json`;
    const archivePath = path.join(process.cwd(), archiveFile);
    
    if (fs.existsSync(activeFile)) {
        // Read to count messages
        const data = fs.readFileSync(activeFile, "utf-8");
        const msgs = JSON.parse(data);
        session.messageCount = msgs.length;
        
        fs.renameSync(activeFile, archivePath);
        session.messagesFile = archiveFile;
    }
  }

  user.activeSessionId = undefined;
  saveUser(user);
}

// --- Chat History Management (Per Streamer) ---

export function getHistoryFile(streamerId: string) {
  return path.join(process.cwd(), `chat-history-${streamerId}.json`);
}

export function saveMessage(message: ChatMessage) {
  try {
    const streamerId = message.streamerId || "global";
    const file = getHistoryFile(streamerId);
    
    let history: ChatMessage[] = [];
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf-8");
      history = JSON.parse(data) as ChatMessage[];
    }
    
    history.push(message);
    
    if (history.length > 2000) { // Increased buffer
      history = history.slice(-2000);
    }
    
    fs.writeFileSync(file, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("[Persistence] Failed to save message:", error);
  }
}

export function loadHistory(streamerId?: string, archiveFile?: string): ChatMessage[] {
  try {
    let file;
    if (archiveFile) {
        file = path.join(process.cwd(), archiveFile);
    } else {
        const id = streamerId || "global";
        file = getHistoryFile(id);
    }
    
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf-8");
      return JSON.parse(data) as ChatMessage[];
    }
  } catch (error) {
    console.error("[Persistence] Failed to load history:", error);
  }
  return [];
}
