// =============================================================================
// PRODUCER HANDLER - Factory pro API handlery jednotlivych platforem
// Kazda platforma (Twitch, YouTube, Kick) pouziva tento handler
// Prijima POST requesty s chat zpravami a dispatchuje je do workeru
// =============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { dispatchToWorker } from "@/lib/worker-manager";
import type { ProducerPlatform } from "@/types/chat";
import { cookies } from "next/headers";

// Vynuceni Node.js runtime (ne Edge) - potrebujeme worker thready a SharedArrayBuffer
export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

// Predpripravena chybova odpoved
const invalidPayload = NextResponse.json(
  { error: "Both user and text are required" },
  { status: 400 },
);

// Factory funkce - vytvori handler pro danou platformu
// Pouziti: export const POST = createProducerHandler("Twitch")
export const createProducerHandler =
  (platform: ProducerPlatform) => async (request: NextRequest) => {
    // Pouze POST metoda
    if (request.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // 1. Autentizace - kontrola session cookie
    const session = cookies().get("streamer_session");
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse session cookie (obsahuje user ID a username)
    let user;
    try {
      user = JSON.parse(session.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 2. Parse request body
    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Extrakce a validace poli
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
      // 3. Dispatch do worker threadu
      // StreamerId z session = zprava se ulozi do spravneho chatu
      dispatchToWorker(platform, { 
        streamerId: user.id,
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
