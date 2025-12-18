// Trovo producer - zpracovava zpravy z Trova
// Trovo je mensi streaming platforma, ale maj dobry features

import { createProducerHandler } from "@/app/api/producers/simple-producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("Trovo");
