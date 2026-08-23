"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Loader2,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { setCachedAuthentication } from "@/lib/useAuth";

function LoginSkeleton() {
  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white lg:grid-cols-[0.8fr_1.2fr]">
      <Skeleton className="h-72 rounded-none lg:h-[31rem]" />
      <div className="space-y-5 p-6 sm:p-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-sm" />
        <Skeleton className="mt-10 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <AdminLoginContent />
    </Suspense>
  );
}

function AdminLoginContent() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect");
  const redirectTo =
    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/";

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
        if (data.authenticated) router.replace(redirectTo);
      } catch {
        // Stay on the sign-in screen and let the coordinator retry.
      } finally {
        if (active) setChecking(false);
      }
    }

    checkAuth();
    return () => {
      active = false;
    };
  }, [redirectTo, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setCachedAuthentication(true);
        toast.success("Coordinator signed in");
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const data = await response.json();
      setError(
        response.status === 429
          ? data.error || "Too many attempts. Try again in a few minutes."
          : "That password doesn’t match. Check it and try again."
      );
    } catch {
      setError("Sign-in could not reach the club system. Check the connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <LoginSkeleton />;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#5B6870] hover:text-[#2C2E35]"
      >
        <ArrowLeft className="size-4" />
        Back to the public exchange
      </Link>

      <div className="grid overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white shadow-[0_20px_56px_rgba(44,46,53,0.09)] lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden bg-[#2C2E35] p-7 text-white sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-28 size-72 rounded-full border-[44px] border-[#BC1F25]/30"
          />
          <span className="relative flex size-12 items-center justify-center rounded-full bg-white/10 text-[#F1B9BC]">
            <LockKeyhole className="size-5" />
          </span>
          <h1 className="relative mt-7 font-display text-4xl font-bold uppercase leading-[0.94] tracking-[-0.035em] sm:text-5xl">
            Coordinator sign in
          </h1>
          <p className="relative mt-5 max-w-sm text-sm leading-6 text-white/65">
            Open the equipment room workspace for inventory, family requests,
            checkouts, and session sheets.
          </p>
          <ul className="relative mt-9 space-y-4 border-t border-white/12 pt-7 text-sm text-white/75">
            <li className="flex items-center gap-3">
              <ClipboardCheck className="size-4 text-[#F1B9BC]" />
              Process family requests
            </li>
            <li className="flex items-center gap-3">
              <PackageCheck className="size-4 text-[#F1B9BC]" />
              Check gear in and out
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-[#F1B9BC]" />
              Keep family details private
            </li>
          </ul>
        </aside>

        <div className="p-6 sm:p-10">
          <div className="border-b border-[#E3E7E9] pb-6">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#2C2E35]">
              Enter the coordinator password
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5B6870]">
              Your session stays signed in on this device for seven days.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Coordinator password"
              autoComplete="current-password"
              autoFocus
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : "login-hint"}
              className="mt-2 h-12 bg-white"
            />
            {error ? (
              <p
                id="login-error"
                role="alert"
                className="mt-3 rounded-xl border border-[#E5C5CA] bg-[#FBEDEF] px-4 py-3 text-sm font-semibold text-[#8E2635]"
              >
                {error}
              </p>
            ) : (
              <p id="login-hint" className="mt-2 text-xs text-[#69767E]">
                The password is managed by the Broomstones equipment team.
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-6 h-12 w-full rounded-full bg-[#BC1F25] text-white hover:bg-[#99191E]"
              disabled={loading || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Open season operations
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
