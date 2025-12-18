// TikTok producer - zpracovava zpravy z TikTok Live
// TikTok je hlavne pro kratky videa ale maj i live streaming

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("TikTok");
