"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_EVENT = "broomstones-auth-changed";
let cachedAuthentication: boolean | null = null;
let authenticationRequest: Promise<boolean> | null = null;

async function getAuthentication(force = false) {
  if (!force && cachedAuthentication !== null) {
    return cachedAuthentication;
  }

  if (!force && authenticationRequest) {
    return authenticationRequest;
  }

  authenticationRequest = fetch("/api/auth")
    .then(async (response) => {
      const data = await response.json();
      const value = Boolean(data.authenticated);
      setCachedAuthentication(value);
      return value;
    })
    .catch(() => {
      setCachedAuthentication(false);
      return false;
    })
    .finally(() => {
      authenticationRequest = null;
    });

  return authenticationRequest;
}

export function setCachedAuthentication(value: boolean) {
  cachedAuthentication = value;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: value }));
  }
}

export function useAuth(requireAuth: boolean = true) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(
    cachedAuthentication
  );
  const [loading, setLoading] = useState(cachedAuthentication === null);
  const router = useRouter();

  const checkAuth = useCallback(async (force = false) => {
    const value = await getAuthentication(force);
    setAuthenticated(value);

    if (requireAuth && !value) {
      router.push("/admin");
    }
    setLoading(false);
  }, [requireAuth, router]);

  useEffect(() => {
    function syncAuthentication(event: Event) {
      const value = (event as CustomEvent<boolean>).detail;
      setAuthenticated(value);
      setLoading(false);
    }

    window.addEventListener(AUTH_EVENT, syncAuthentication);

    void getAuthentication(requireAuth).then((value) => {
      setAuthenticated(value);
      setLoading(false);

      if (requireAuth && !value) {
        router.push("/admin");
      }
    });

    return () => window.removeEventListener(AUTH_EVENT, syncAuthentication);
  }, [requireAuth, router]);

  const logout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setCachedAuthentication(false);
      router.push("/");
      router.refresh();
    } catch {
      console.error("Logout failed");
    }
  };

  return { authenticated, loading, logout, checkAuth };
}
