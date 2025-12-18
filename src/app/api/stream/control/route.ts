// Stream Control - startuje a ukoncuje streamy
// Kdyz streamer klikne "Start Stream", zavola se tohle

import { NextResponse } from "next/server";
import { startSession, endSession, getMessages, findUserById } from "@/lib/simple-store";
import { cookies } from "next/headers";
import { webhookSender } from "@/lib/webhook-sender";

export const dynamic = "force-dynamic";

// Tady si pamatujeme kdy ktery stream zacal
// Pouzivame to pro pocitani delky streamu
const streamStartTimes = new Map<string, number>();

export async function POST(req: Request) {
  // Overime ze je uzivatel prihlasenej
  const cookieStore = await cookies();
  const session = cookieStore.get("streamer_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const user = JSON.parse(session.value);
  const { action } = await req.json();

  // AKCE: START STREAM
  if (action === "start") {
    // Vytvorime novou session - tohle taky smaze stary zpravy
    const sessionId = startSession(user.id);
    const startedAt = Date.now();
    streamStartTimes.set(user.id, startedAt);
    
    // Poslem webhook do Bety ze zacal stream
    webhookSender.sendStreamStart({
      streamerId: user.id,
      username: user.username,
      startedAt,
      platforms: ['twitch', 'youtube', 'kick'] // TODO: zjistit skutecny platformy
    }).catch(err => console.error('[Webhook] Stream start selhal:', err));
    
    console.log(`[Stream] Zacal stream pro ${user.username}`, { sessionId, startedAt });
    
    return NextResponse.json({ 
      ok: true, 
      status: "started",
      sessionId,
      startedAt
    });
  } 
  
  // AKCE: END STREAM
  if (action === "end") {
    endSession(user.id);
    const endedAt = Date.now();
    const startedAt = streamStartTimes.get(user.id) || endedAt;
    const duration = endedAt - startedAt;
    
    // Spocitame statistiky ze streamu
    const allMessages = getMessages(user.id);
    const messageCount = allMessages.length;
    const uniqueUsers = new Set(allMessages.map(m => m.user)).size; // pocet unikatnich lidi
    const bannedUsers = 0; // TODO: pocitat zabanovaný
    const averageToxicity = 0; // TODO: pocitat prumernou toxicitu
    
    // Kolik zprav z ktery platformy
    const platformBreakdown: Record<string, number> = {};
    allMessages.forEach(msg => {
      platformBreakdown[msg.platform] = (platformBreakdown[msg.platform] || 0) + 1;
    });
    
    // Poslem webhook do Bety ze skoncil stream + statistiky
    webhookSender.sendStreamEnd({
      streamerId: user.id,
      username: user.username,
      startedAt,
      endedAt,
      duration,
      messageCount,
      uniqueUsers,
      bannedUsers,
      averageToxicity,
      platformBreakdown
    }).catch(err => console.error('[Webhook] Stream end selhal:', err));
    
    streamStartTimes.delete(user.id);
    
    console.log(`[Stream] Skoncil stream pro ${user.username}`, {
      duration: `${Math.round(duration / 1000)}s`,
      messageCount,
      uniqueUsers
    });
    
    return NextResponse.json({ 
      ok: true, 
      status: "ended",
      endedAt,
      duration,
      stats: {
        messageCount,
        uniqueUsers,
        platformBreakdown
      }
    });
  }

  // Neznama akce
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
