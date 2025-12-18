// Messages endpoint - vraci vsechny zpravy pro danyho streamera
// Frontend to vola kazdych par sekund aby zobrazil novyjzpravy

import { NextResponse } from "next/server";
import { getMessages } from "@/lib/simple-store";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // vzdy fresh data, zadny cache

export async function GET() {
  // Ziskame session z cookie
  const cookieStore = await cookies();
  const session = cookieStore.get("streamer_session");
  
  // Neni prihlasenej? Vratime prazdny list
  if (!session?.value) {
    return NextResponse.json({ messages: [] });
  }

  try {
    // Parsnem user data ze session
    const user = JSON.parse(session.value);
    
    // Ziskame vsechny zpravy pro tohodle streamera
    const messages = getMessages(user.id);
    
    console.log(`[API/messages] Vracim ${messages.length} zprav pro streamera ${user.id}`);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[API/messages] Error:", error);
    return NextResponse.json({ messages: [] });
  }
}
