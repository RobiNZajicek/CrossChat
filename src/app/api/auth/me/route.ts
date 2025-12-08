import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findUserById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("streamer_session");
  
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(session.value);
    const user = findUserById(sessionData.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      activeSessionId: user.activeSessionId,
      sessions: user.sessions || [],
      stats: user.stats,
      subscriberCounts: user.subscriberCounts
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
