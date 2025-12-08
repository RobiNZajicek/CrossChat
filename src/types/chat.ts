// =============================================================================
// CHAT TYPES - Typy pro chat zpravy
// Pouziva se v celem projektu (frontend, backend, worker)
// =============================================================================

// Podporovane platformy (9 celkem)
export type ProducerPlatform = 
  | "Twitch" 
  | "YouTube" 
  | "Kick" 
  | "Facebook" 
  | "TikTok" 
  | "Discord" 
  | "Bilibili" 
  | "X" 
  | "Trovo";

// Typ pro chat zpravu (ulozena v DB / poslana klientum)
export interface ChatMessage {
  id: string;                     // Unikatni ID zpravy (UUID)
  streamerId: string;             // ID streamera kteremu patri
  text: string;                   // Text zpravy
  user: string;                   // Jmeno uzivatele ktery zpravu napsal
  platform: ProducerPlatform;     // Z jake platformy prisla
  timestamp: number;              // Unix timestamp (ms)
  isVip?: boolean;                // Je uzivatel VIP?
  isSub?: boolean;                // Je uzivatel subscriber?
  isMod?: boolean;                // Je uzivatel moderator?
  color?: string;                 // Barva jmena (hex kod)
}

// Typ pro payload z API (pred zpracovanim workerem)
export interface ProducerPayload {
  streamerId: string;             // ID streamera (z session cookie)
  user: string;                   // Jmeno uzivatele
  text: string;                   // Text zpravy
  isVip?: boolean;
  isSub?: boolean;
  isMod?: boolean;
  color?: string;
}
