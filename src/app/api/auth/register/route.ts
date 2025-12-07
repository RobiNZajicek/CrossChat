import { NextResponse } from "next/server";
import { findUserByUsername, saveUser, type User } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid credentials. Password must be at least 6 chars." },
        { status: 400 }
      );
    }

    if (findUserByUsername(username)) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 409 }
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
        subscriberCounts: {
          twitch: Math.floor(Math.random() * 500),
          youtube: Math.floor(Math.random() * 800),
          kick: Math.floor(Math.random() * 200),
          facebook: Math.floor(Math.random() * 300),
          tiktok: Math.floor(Math.random() * 1000),
          discord: Math.floor(Math.random() * 150),
          bilibili: Math.floor(Math.random() * 100),
          x: Math.floor(Math.random() * 50),
          trovo: Math.floor(Math.random() * 80),
        }
      }
    };

    saveUser(newUser);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

