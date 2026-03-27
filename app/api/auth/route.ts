import { NextRequest, NextResponse } from "next/server";
import {
  setAuthCookie,
  clearAuthCookie,
  isAuthenticated,
  getCoordinatorPassword,
  checkRateLimit,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed, retryAfterMs } = checkRateLimit(ip);

    if (!allowed) {
      const retryMinutes = Math.ceil((retryAfterMs ?? 0) / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryMinutes} minutes.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (password === getCoordinatorPassword()) {
      await setAuthCookie();
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authed = await isAuthenticated();
    return NextResponse.json({ authenticated: authed });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
