import { NextResponse } from "next/server";
import { loadHistory } from "@/lib/db";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const archive = searchParams.get("archive");

  const session = cookies().get("streamer_session");
  if (!session?.value) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const user = JSON.parse(session.value);
    console.log(`[API Messages] Loading ${archive ? `archive: ${archive}` : `active chat for user ${user.id}`}`);
    
    // If archive param exists, load that specific file, else load active history
    const messages = loadHistory(user.id, archive || undefined);
    console.log(`[API Messages] Loaded ${messages.length} messages`);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(`[API Messages] Error loading messages:`, error);
    return NextResponse.json({ messages: [] });
  }
}
