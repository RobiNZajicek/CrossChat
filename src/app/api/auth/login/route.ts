import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/db";
import bcrypt from "bcryptjs";
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

    const user = findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("streamer_session", JSON.stringify({ id: user.id, username: user.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log("[Login] User logged in:", user.username);

    return NextResponse.json({ ok: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
