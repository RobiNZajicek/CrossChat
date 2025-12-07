import { createProducerHandler } from "@/app/api/producers/producer-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createProducerHandler("X");

