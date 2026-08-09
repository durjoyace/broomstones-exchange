import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "broomstones_auth";

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
  const signedBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );
  const expected = Array.from(new Uint8Array(signedBytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (signature.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < signature.length; index++) {
    mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return mismatch === 0 && value.startsWith("authenticated:");
}

function isPublicFamilyMutation(request: NextRequest) {
  if (request.method !== "POST") return false;

  return ["/api/kids", "/api/requests", "/api/waitlist"].includes(
    request.nextUrl.pathname
  );
}

export async function proxy(request: NextRequest) {
  if (isPublicFamilyMutation(request)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(COOKIE_NAME);
  const authenticated =
    authCookie?.value && (await verifySignedCookie(authCookie.value));

  if (!authenticated) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    "/api/checkouts/:path*",
    "/api/equipment/:path*",
    "/api/kids/:path*",
    "/api/requests/:path*",
    "/api/waitlist/:path*",
  ],
};
