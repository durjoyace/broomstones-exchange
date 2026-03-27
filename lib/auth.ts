import { createHmac } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "broomstones_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is required");
  }
  return secret;
}

function sign(value: string): string {
  const signature = createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
  return `${value}.${signature}`;
}

function verify(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = signed.substring(0, lastDot);
  const signature = signed.substring(lastDot + 1);

  const expected = createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");

  // Timing-safe comparison
  if (signature.length !== expected.length) return null;

  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }

  return mismatch === 0 ? value : null;
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

// ─── Cookie Management ──────────────────────────────────────────────────────

export async function setAuthCookie() {
  const cookieStore = await cookies();
  const timestamp = Date.now().toString();
  const signedValue = sign(`authenticated:${timestamp}`);

  cookieStore.set(COOKIE_NAME, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(COOKIE_NAME);

    if (!authCookie?.value) return false;

    const value = verify(authCookie.value);
    return value !== null && value.startsWith("authenticated:");
  } catch {
    return false;
  }
}

export function getCoordinatorPassword(): string {
  const password = process.env.COORDINATOR_PASSWORD;
  if (!password) {
    throw new Error("COORDINATOR_PASSWORD environment variable is required");
  }
  return password;
}
