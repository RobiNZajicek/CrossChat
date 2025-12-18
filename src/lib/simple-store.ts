// Jednoduchy ukladaci system - vsechno je v pameti
// Pouzivame globalThis aby to prezilo hot reload v Next.js (jinak by se to porad mazalo)

import type { ChatMessage } from "@/types/chat";

// Typ pro uzivatele - co o nem vime
type User = {
  id: string;              // unikatni id
  username: string;        // jmeno
  passwordHash: string;    // zaheslovany heslo (ne plaintext, to by bylo blby)
  activeSessionId?: string; // id aktualniho streamu (pokud streamuje)
};

// Info o banu - proc a dokdy
type BanInfo = { reason: string; until?: number };

// Tohle je mega dulezity - globalThis drzi data i kdyz se server restartuje
// Bez toho by se vsechny zpravy smazaly pri kazdem ukladu souboru
const globalStore = globalThis as typeof globalThis & {
  __crosschat_users?: Map<string, User>;
  __crosschat_messages?: Map<string, ChatMessage[]>;
  __crosschat_sessions?: Map<string, string[]>;
  __crosschat_bans?: Map<string, BanInfo>;
};

// Kdyz jeste neexistujou, tak je vytvorime
// Kdyz uz existujou, pouzijeme ty stary (data zustanou)
if (!globalStore.__crosschat_users) {
  globalStore.__crosschat_users = new Map();
}
if (!globalStore.__crosschat_messages) {
  globalStore.__crosschat_messages = new Map();
}
if (!globalStore.__crosschat_sessions) {
  globalStore.__crosschat_sessions = new Map();
}
if (!globalStore.__crosschat_bans) {
  globalStore.__crosschat_bans = new Map();
}

// Pouzijeme globalni storage
const users = globalStore.__crosschat_users;
const messages = globalStore.__crosschat_messages;
const sessions = globalStore.__crosschat_sessions;
const bannedUsers = globalStore.__crosschat_bans;

// ============================================================================
// OPERACE S UZIVATELI - ukladani, hledani, updatovani
// ============================================================================

// Ulozi uzivatele do mapy
export function saveUser(user: User) {
  users.set(user.id, user);
}

// Najde uzivatele podle jmena - vraci undefined kdyz neexistuje
export function findUserByUsername(username: string): User | undefined {
  return Array.from(users.values()).find(u => u.username === username);
}

// Najde uzivatele podle ID - rychlejsi nez podle jmena
export function findUserById(id: string): User | undefined {
  return users.get(id);
}

// Updatne uzivatele - treba kdyz zacne streamovat
export function updateUser(id: string, updates: Partial<User>) {
  const user = users.get(id);
  if (user) {
    users.set(id, { ...user, ...updates });
  }
}

// Vrati vsechny uzivatele - pro adminy
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

// ============================================================================
// OPERACE SE ZPRAVAMI - ukladani, cteni, mazani
// ============================================================================

// Ulozi zpravu do chatu - kazdy streamer ma svuj list zprav
export function saveMessage(message: ChatMessage) {
  const key = message.streamerId;
  
  // Kdyz streamer jeste nema zadny zpravy, vytvorime prazdny list
  if (!messages.has(key)) {
    messages.set(key, []);
  }
  
  // Pridame zpravu na konec
  messages.get(key)!.push(message);
  
  // Nechame max 300 zprav - jinak by to zralo moc pameti
  const msgs = messages.get(key)!;
  if (msgs.length > 300) {
    msgs.shift(); // smaze nejstarsi
  }
}

// Vrati vsechny zpravy pro danyho streamera
export function getMessages(streamerId: string): ChatMessage[] {
  return messages.get(streamerId) || [];
}

// Smaze vsechny zpravy - pouziva se kdyz zacne novej stream
export function clearMessages(streamerId: string) {
  messages.set(streamerId, []);
}

// Smaze konkretni zpravu podle ID - pro moderatory
export function deleteMessage(streamerId: string, messageId: string) {
  const msgs = messages.get(streamerId);
  if (msgs) {
    const filtered = msgs.filter(m => m.id !== messageId);
    messages.set(streamerId, filtered);
  }
}

// ============================================================================
// OPERACE SE STREAMY - startovani, ukoncovani
// ============================================================================

// Zacne novej stream - smaze stary zpravy a vytvori novy session ID
export function startSession(streamerId: string): string {
  const sessionId = crypto.randomUUID();
  
  if (!sessions.has(streamerId)) {
    sessions.set(streamerId, []);
  }
  
  sessions.get(streamerId)!.push(sessionId);
  
  // Dulezity! Smazeme stary zpravy aby se nemichaly s novyma
  clearMessages(streamerId);
  
  // Updatneme uzivatele ze ted streamuje
  updateUser(streamerId, { activeSessionId: sessionId });
  
  return sessionId;
}

// Ukonci stream
export function endSession(streamerId: string) {
  updateUser(streamerId, { activeSessionId: undefined });
}

// Vrati vsechny session ID pro danyho streamera
export function getSessions(streamerId: string): string[] {
  return sessions.get(streamerId) || [];
}

// ============================================================================
// OPERACE S BANY - banovani, odbanovani, checkovani
// ============================================================================

// Zabanuje uzivatele - muze byt permanentni nebo na cas
export function banUser(
  streamerId: string, 
  username: string, 
  reason: string, 
  duration?: number  // v sekundach, kdyz neni = permanentni
) {
  const key = `${streamerId}:${username}`;
  // Kdyz je duration, spocitame kdy vyprsi
  const until = duration ? Date.now() + (duration * 1000) : undefined;
  
  bannedUsers.set(key, { reason, until });
  
  console.log(`[Store] Zabanovan ${username} u streamera ${streamerId}: ${reason}`);
}

// Odbanuje uzivatele
export function unbanUser(streamerId: string, username: string) {
  const key = `${streamerId}:${username}`;
  bannedUsers.delete(key);
  
  console.log(`[Store] Odbanovan ${username} u streamera ${streamerId}`);
}

// Checkne jestli je uzivatel zabanovanej
// Taky automaticky odbanuje kdyz vyprsel timeout
export function isUserBanned(streamerId: string, username: string): boolean {
  const key = `${streamerId}:${username}`;
  const ban = bannedUsers.get(key);
  
  // Neni zabanovanej
  if (!ban) return false;
  
  // Ma timeout a uz vyprsel? Automaticky odbanujeme
  if (ban.until && Date.now() > ban.until) {
    bannedUsers.delete(key);
    return false;
  }
  
  // Jo, je zabanovanej
  return true;
}

// Vrati info o banu - proc a dokdy
export function getBanInfo(streamerId: string, username: string) {
  const key = `${streamerId}:${username}`;
  return bannedUsers.get(key);
}
