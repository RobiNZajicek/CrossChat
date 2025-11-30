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
    // If archive param exists, load that specific file, else load active history
    const messages = loadHistory(user.id, archive || undefined);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
