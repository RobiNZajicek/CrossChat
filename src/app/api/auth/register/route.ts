import { NextResponse } from "next/server";
import { findUserByUsername, saveUser, type User } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if username exists
    if (findUserByUsername(username)) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
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

    saveUser(newUser);

    // Auto-login after registration
    const cookieStore = await cookies();
    cookieStore.set("streamer_session", JSON.stringify({ id: newUser.id, username: newUser.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("[Register] New user created:", newUser.username);

    return NextResponse.json({ ok: true, user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
