// Login endpoint - prihlasuje uzivatele
// Kdyz posles spravny username a heslo, dostanes cookie a jsi prihlasenej

import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parsnem username a heslo z requestu
    const { username, password } = await req.json();

    // Musi byt oba - jinak to nedava smysl
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Najdem uzivatele v databazi
    const user = findUserByUsername(username);
    if (!user) {
      // User neexistuje, ale nechceme hackerum rict co presne je spatne
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Porovname hesla - bcrypt.compare porovna plaintext s hashem
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      // Spatny heslo
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Vsechno ok! Nastavime session cookie
    // httpOnly = JavaScript nemuze cist cookie (ochrana proti XSS)
    const cookieStore = await cookies();
    cookieStore.set("streamer_session", JSON.stringify({ id: user.id, username: user.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // Cookie vydrzi 1 tyden
    });

    console.log("[Login] Uzivatel prihlasen:", user.username);

    return NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
