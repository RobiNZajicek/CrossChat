// Facebook producer - zpracovava zpravy z Facebook Live
// Dost lidi streamuje na Facebooku, hlavne starsi generace

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("Facebook");
