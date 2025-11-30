export type ProducerPlatform = "Twitch" | "YouTube" | "Kick";

export interface ChatMessage {
  id: string;
  streamerId: string; // The ID of the streamer this message belongs to
  text: string;
  user: string;
  platform: ProducerPlatform;
  timestamp: number;
  isVip?: boolean;
  isSub?: boolean;
  isMod?: boolean;
  color?: string;
}

export interface ProducerPayload {
  streamerId: string; // Required for routing
  user: string;
  text: string;
  isVip?: boolean;
  isSub?: boolean;
  isMod?: boolean;
  color?: string;
}
