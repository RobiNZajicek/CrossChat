import { NextResponse } from "next/server";
import { startNewSession, endSession } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const session = cookies().get("streamer_session");
  if (!session?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = JSON.parse(session.value);

  const { action } = await req.json();

  if (action === "start") {
    startNewSession(user.id);
    return NextResponse.json({ ok: true, status: "started" });
  } 
  
  if (action === "end") {
    endSession(user.id);
    return NextResponse.json({ ok: true, status: "ended" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

