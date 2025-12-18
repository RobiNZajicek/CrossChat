// Kick producer - zpracovava zpravy z Kicku
// Kick je takovej novej streaming site co konkuruje Twitchi

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("Kick");
