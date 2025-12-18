// X (Twitter) producer - zpracovava zpravy z X Spaces
// X mel driv Spaces pro live audio, ted maj i video

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("X");
