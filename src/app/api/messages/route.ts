import { NextResponse } from "next/server";
import { loadHistory } from "@/lib/db";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const archive = searchParams.get("archive");

  const cookieStore = await cookies();
  const session = cookieStore.get("streamer_session");
  if (!session?.value) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const user = JSON.parse(session.value);
    const messages = loadHistory(user.id, archive || undefined);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
