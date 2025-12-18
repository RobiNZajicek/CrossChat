// Register endpoint - registruje novyho uzivatele
// Posles username a heslo, vytvori se novej account a automaticky te prihlasi

import { NextResponse } from "next/server";
import { findUserByUsername, saveUser, type User } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Zakladni validace - musi byt oba
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Username musi mit aspon 3 znaky
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Heslo musi mit aspon 6 znaku (bezpecnost first!)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Checkneme jestli uz username neni zabrany
    if (findUserByUsername(username)) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Zahashujeme heslo - nikdy neukladame plaintext!
    // bcrypt.hash s 10 rounds je dobry kompromis mezi bezpecnosti a rychlosti
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vytvorime novyho usera s nahodnyma subscriber counts
    // (v realny appce by tohle prislo z API Twitche atd)
    const newUser: User = {
      id: randomUUID(),
      username,
      passwordHash: hashedPassword,
      createdAt: Date.now(),
      sessions: [],
      stats: {
        totalMessages: 0,
        totalStreams: 0,
        lastViewCount: 0,
      },
      // Nahodny subscriber counts pro demo ucely
      subscriberCounts: {
        Twitch: Math.floor(Math.random() * 1000) + 50,
        YouTube: Math.floor(Math.random() * 500) + 20,
        Kick: Math.floor(Math.random() * 200) + 10,
        Facebook: Math.floor(Math.random() * 300) + 15,
        TikTok: Math.floor(Math.random() * 1000) + 50,
        Discord: Math.floor(Math.random() * 100) + 5,
        Bilibili: Math.floor(Math.random() * 200) + 10,
        X: Math.floor(Math.random() * 50) + 5,
        Trovo: Math.floor(Math.random() * 150) + 8,
      },
    };

    // Ulozime do "databaze" (v nasem pripade JSON file)
    saveUser(newUser);

    // Auto-login - rovnou ho prihlasime at nemusi znova zadavat heslo
    const cookieStore = await cookies();
    cookieStore.set("streamer_session", JSON.stringify({ id: newUser.id, username: newUser.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("[Register] Novej uzivatel vytvoren:", newUser.username);

    return NextResponse.json({ ok: true, user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
