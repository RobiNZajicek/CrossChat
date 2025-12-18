// Twitch producer - zpracovava zpravy z Twitche
// Pouziva spolecny handler protoze logika je stejna pro vsechny platformy

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vytvorime handler pro Twitch - jednoduchyno?
export const POST = createProducerHandler("Twitch");
