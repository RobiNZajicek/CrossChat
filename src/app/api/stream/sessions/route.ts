import { NextResponse } from "next/server";
import { findUserById } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("streamer_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const userData = JSON.parse(session.value);
  const user = findUserById(userData.id);
  if (!user) return NextResponse.json({ sessions: [] });

  const sessions = (user.sessions || []).sort((a, b) => b.startedAt - a.startedAt);
  return NextResponse.json({ sessions });
}
