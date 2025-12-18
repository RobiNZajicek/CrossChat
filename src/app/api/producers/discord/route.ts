// Discord producer - zpracovava zpravy z Discordu
// Discord je hlavne pro gaming komunity

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("Discord");
