import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/db";

export async function GET() {
  const session = cookies().get("streamer_session");
  
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(session.value);
    const user = findUserById(sessionData.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Vrati user data bez passwordHash
    const { passwordHash, ...userData } = user;
    
    return NextResponse.json({ user: userData });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

