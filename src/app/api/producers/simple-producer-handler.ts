// Producer Handler - zpracovava zpravy z ruznych platforem (Twitch, YouTube, Kick, atd)
// Tohle je HLAVNI soubor pro zpracovani chatu - vsechno co prijde projde tudy

import { NextResponse, type NextRequest } from "next/server";
import type { ProducerPlatform } from "@/types/chat";
import { cookies } from "next/headers";
import { saveMessage, isUserBanned, banUser } from "@/lib/simple-store";
import { moderateMessage } from "@/lib/moderation";
import { webhookSender } from "@/lib/webhook-sender";
import { broadcastMessage } from "@/lib/socket-broadcaster";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

/**
 * Factory funkce - vytvori handler pro danou platformu
 * Proc factory? Protoze logika je stejna pro vsechny platformy, jenom se lisi jmeno
 * 
 * Pouziti:
 * export const POST = createProducerHandler('twitch')
 * export const POST = createProducerHandler('youtube')
 * atd...
 */
export const createProducerHandler =
  (platform: ProducerPlatform) => async (request: NextRequest) => {
    // Jenom POST metoda je povolena
    if (request.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // KROK 1: Overime ze uzivatel je prihlasenej
    // Session je v cookie - kdyz neni, tak neni prihlasenej
    const cookieStore = await cookies();
    const session = cookieStore.get("streamer_session");
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parsnem session data
    let user;
    try {
      user = JSON.parse(session.value);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // KROK 2: Parsnem payload ze zpravy
    // Payload = data co nam poslal frontend (username, text zpravy, atd)
    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Vytahneme jednotlivy fieldy a dame jim defaulty kdyz chybej
    const username = typeof payload.user === "string" ? payload.user : "";
    const text = typeof payload.text === "string" ? payload.text : "";
    const isVip = typeof payload.isVip === "boolean" ? payload.isVip : false;
    const isSub = typeof payload.isSub === "boolean" ? payload.isSub : false;
    const isMod = typeof payload.isMod === "boolean" ? payload.isMod : false;
    const color = typeof payload.color === "string" ? payload.color : undefined;

    // Musi byt username a text - jinak to nedava smysl
    if (!username.trim() || !text.trim()) {
      return NextResponse.json(
        { error: "Both user and text are required" },
        { status: 400 },
      );
    }

    // KROK 3: Checkneme jestli neni uzivatel zabanovanej
    // Kdyz jo, tak jeho zprava neprojde
    if (isUserBanned(user.id, username)) {
      return NextResponse.json(
        { error: "User is banned from this channel" },
        { status: 403 }
      );
    }

    // KROK 4: AI MODERACE - tohle je ta hlavni magie
    // Checkne jestli zprava neobsahuje banned words
    const modResult = moderateMessage(username, text);
    
    // Kdyz moderace rekla NE, tak zpravu zablokujeme
    if (!modResult.allowed) {
      console.log(`[${platform}] ❌ Zprava zablokovana:`, {
        user: username,
        reason: modResult.reason,
        score: modResult.score,
        action: modResult.action
      });
      
      // Kdyz je to mega spatny (score 100), tak automaticky zabanujeme
      if (modResult.action === 'ban') {
        banUser(user.id, username, modResult.reason || 'Porusil pravidla chatu');
        
        // Poslem info o banu do Bety (async - necekame na odpoved)
        webhookSender.sendModerationBan({
          user: username,
          streamerId: user.id,
          reason: modResult.reason || 'Porusil pravidla chatu',
          moderationScore: modResult.score,
          permanent: true,
          triggeredBy: 'ai_moderation',
          details: modResult.details
        }).catch(err => console.error('[Webhook] Ban send selhal:', err));
        
      } else if (modResult.action === 'timeout') {
        // Timeout na 10 minut (600 sekund)
        banUser(user.id, username, modResult.reason || 'Spam/Toxic', 600);
        
        webhookSender.sendModerationBan({
          user: username,
          streamerId: user.id,
          reason: modResult.reason || 'Spam/Toxic',
          moderationScore: modResult.score,
          permanent: false,
          duration: 600000, // 10 minut v ms
          expiresAt: Date.now() + 600000,
          triggeredBy: 'spam_detection',
          details: modResult.details
        }).catch(err => console.error('[Webhook] Timeout send selhal:', err));
      }
      
      // Vratime error response
      return NextResponse.json(
        { 
          error: "Zprava zablokovana moderaci",
          reason: modResult.reason,
          action: modResult.action,
          score: modResult.score
        },
        { status: 403 }
      );
    }

    try {
      // KROK 5: Zpracujeme zpravu
      // Vytvorime objekt se vsema potrebnyma datama
      const processed = {
        id: randomUUID(),      // unikatni ID
        user: username,
        text: text,
        platform: platform,    // twitch, youtube, kick, atd
        streamerId: user.id,
        timestamp: Date.now(), // cas kdy prisla
        isVip,
        isSub,
        isMod,
        color
      };

      // KROK 6: Ulozime zpravu do store
      saveMessage(processed);

      // KROK 7: Posleme zpravu vsem pripojenym klientum pres Socket.IO
      // Diky tomuhle lidi vidi zpravy okamzite bez refreshe
      broadcastMessage(processed);
      
      // KROK 8: Poslem zpravu do Beta projektu pres webhook
      // Beta to pouziva pro analytics a dashboard
      webhookSender.sendChatMessage({
        id: processed.id,
        user: processed.user,
        text: processed.text,
        platform: processed.platform,
        streamerId: processed.streamerId,
        timestamp: processed.timestamp,
        moderationScore: modResult.score,
        isVip: processed.isVip,
        isSub: processed.isSub,
        isMod: processed.isMod,
        color: processed.color
      }).catch(err => console.error('[Webhook] Message send selhal:', err));

      // Logneme ze se to povedlo
      console.log(`[${platform}] ✅ Zprava zpracovana:`, {
        user: username,
        text: text.substring(0, 50), // jenom prvnich 50 znaku
        modScore: modResult.score
      });

      // Vratime success response
      return NextResponse.json({ 
        ok: true,
        message: processed,
        moderation: {
          score: modResult.score,
          passed: true
        }
      });
      
    } catch (error) {
      // Neco se mega posralo
      console.error("[Producer API] Error:", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  };
