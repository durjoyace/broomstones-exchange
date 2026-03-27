import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "broomstones_auth";

// HMAC-SHA256 using Web Crypto API (Edge-compatible)
async function verifySignedCookie(signed: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return false;

  const value = signed.substring(0, lastDot);
  const signature = signed.substring(lastDot + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signature.length !== expected.length) return false;

  // Timing-safe comparison
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }

  return mismatch === 0 && value.startsWith("authenticated:");
}

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (!authCookie?.value || !(await verifySignedCookie(authCookie.value))) {
    const loginUrl = new URL("/admin", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/equipment/:path*",
    "/kids/:path*",
    "/checkouts/:path*",
    "/print/:path*",
    "/waitlist/:path*",
    "/match/:path*",
  ],
};
