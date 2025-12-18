// YouTube producer - zpracovava zpravy z YouTube Live chatu
// Stejna logika jako Twitch, jenom jiny jmeno platformy

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("YouTube");
