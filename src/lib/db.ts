// =============================================================================
// DATABASE - Jednoducha JSON-based databaze
// Uklada uzivatele (streamery) a jejich chat historie
// Kazdy streamer ma vlastni soubor s chatem (multi-tenancy)
// =============================================================================

import fs from "node:fs";
import path from "node:path";
import { type ChatMessage } from "@/types/chat";

// Soubor s uzivateli
const USERS_FILE = path.join(process.cwd(), "users.json");

// Typ pro jednu stream session (archiv chatu)
export type StreamSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  messagesFile: string;  // Nazev souboru s archivem
};

// Typ pro uzivatele (streamera)
export type User = {
  id: string;
  username: string;
  passwordHash: string;    // Bcrypt hash hesla
  createdAt: number;
  activeSessionId?: string; // Aktualne bezici stream
  sessions: StreamSession[]; // Historie streamu
};

// =============================================================================
// USER MANAGEMENT - Prace s uzivateli
// =============================================================================

// Nacte vsechny uzivatele ze souboru
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

// Ulozi uzivatele (update nebo insert)
export function saveUser(user: User) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index !== -1) {
    users[index] = user;  // Update existujiciho
  } else {
    users.push(user);     // Pridani noveho
  }
  
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Najde uzivatele podle username (case-insensitive)
export function findUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

// Najde uzivatele podle ID
export function findUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

// =============================================================================
// SESSION MANAGEMENT - Sprava stream sessions
// =============================================================================

// Zacne novou stream session (vymaze aktualni chat, vytvori novou session)
export function startNewSession(userId: string): StreamSession {
  const user = findUserById(userId);
  if (!user) throw new Error("User not found");

  // Ukonci predchozi session pokud existuje
  if (user.activeSessionId) {
    endSession(userId);
  }

  // Vytvoreni nove session
  const newSession: StreamSession = {
    id: `session-${Date.now()}`,
    startedAt: Date.now(),
    messageCount: 0,
    messagesFile: `chat-history-${userId}.json`
  };

  user.activeSessionId = newSession.id;
  user.sessions = user.sessions || [];
  user.sessions.push(newSession);
  
  // Smaze aktualni chat soubor (zacina se s cisty stolem)
  const activeFile = path.join(process.cwd(), newSession.messagesFile);
  if (fs.existsSync(activeFile)) {
    fs.unlinkSync(activeFile);
  }

  saveUser(user);
  return newSession;
}

// Ukonci aktualni session (archivuje chat)
export function endSession(userId: string) {
  const user = findUserById(userId);
  if (!user || !user.activeSessionId) return;

  const session = user.sessions.find(s => s.id === user.activeSessionId);
  if (session) {
    session.endedAt = Date.now();
    
    // Prejmenovani aktivniho chatu na archiv
    const activeFile = path.join(process.cwd(), `chat-history-${userId}.json`);
    const archiveFile = `archive-${userId}-${session.id}.json`;
    const archivePath = path.join(process.cwd(), archiveFile);
    
    if (fs.existsSync(activeFile)) {
      // Spocita pocet zprav pro statistiky
      const data = fs.readFileSync(activeFile, "utf-8");
      const msgs = JSON.parse(data);
      session.messageCount = msgs.length;
      
      // Presune soubor do archivu
      fs.renameSync(activeFile, archivePath);
      session.messagesFile = archiveFile;
    }
  }

  user.activeSessionId = undefined;
  saveUser(user);
}

// =============================================================================
// CHAT HISTORY - Ukladani a nacitani zprav
// =============================================================================

// Vrati cestu k souboru s chatem pro daneho streamera
export function getHistoryFile(streamerId: string) {
  return path.join(process.cwd(), `chat-history-${streamerId}.json`);
}

// Ulozi zpravu do chatu (pripoji na konec)
export function saveMessage(message: ChatMessage) {
  try {
    const streamerId = message.streamerId || "global";
    const file = getHistoryFile(streamerId);
    
    // Nacte existujici zpravy
    let history: ChatMessage[] = [];
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf-8");
      history = JSON.parse(data) as ChatMessage[];
    }
    
    // Prida novou zpravu
    history.push(message);
    
    // Orizne na max 2000 zprav (aby soubor nerostl do nekonecna)
    if (history.length > 2000) {
      history = history.slice(-2000);
    }
    
    fs.writeFileSync(file, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("[Persistence] Failed to save message:", error);
  }
}

// Nacte historii chatu (aktualni nebo z archivu)
export function loadHistory(streamerId?: string, archiveFile?: string): ChatMessage[] {
  try {
    let file;
    
    if (archiveFile) {
      // Cteni z konkretniho archivu
      file = path.join(process.cwd(), archiveFile);
    } else {
      // Cteni aktivniho chatu
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
