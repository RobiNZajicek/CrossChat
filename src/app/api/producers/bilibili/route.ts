// Bilibili producer - zpracovava zpravy z Bilibili
// Bilibili je cinksej YouTube/Twitch - mega popularni v Cine

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("Bilibili");
