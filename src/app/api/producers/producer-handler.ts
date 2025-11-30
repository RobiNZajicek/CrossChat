import { NextResponse, type NextRequest } from "next/server";
import { dispatchToWorker } from "@/lib/worker-manager";
import type { ProducerPlatform } from "@/types/chat";
import { cookies } from "next/headers";

// Force Node.js runtime to ensure shared memory and worker threads work correctly
export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

const invalidPayload = NextResponse.json(
  { error: "Both user and text are required" },
  { status: 400 },
);

export const createProducerHandler =
  (platform: ProducerPlatform) => async (request: NextRequest) => {
    if (request.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // 1. Authenticate Request
    const session = cookies().get("streamer_session");
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(session.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 2. Parse Payload
    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const username = typeof payload.user === "string" ? payload.user : "";
    const text = typeof payload.text === "string" ? payload.text : "";
    const isVip = typeof payload.isVip === "boolean" ? payload.isVip : false;
    const isSub = typeof payload.isSub === "boolean" ? payload.isSub : false;
    const isMod = typeof payload.isMod === "boolean" ? payload.isMod : false;
    const color = typeof payload.color === "string" ? payload.color : undefined;

    if (!username.trim() || !text.trim()) {
      return invalidPayload;
    }

    try {
      // 3. Dispatch to Worker with streamerId from session
      dispatchToWorker(platform, { 
        streamerId: user.id, // CRITICAL: This was missing!
        user: username, 
        text, 
        isVip, 
        isSub, 
        isMod, 
        color 
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("[Producer API] Dispatch failed:", error);
      return NextResponse.json({ error: "Internal dispatch error" }, { status: 500 });
    }
  };
