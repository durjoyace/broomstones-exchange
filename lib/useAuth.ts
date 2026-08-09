"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth: boolean = true) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth");
      const data = await response.json();
      setAuthenticated(data.authenticated);

      if (requireAuth && !data.authenticated) {
        router.push("/admin");
      }
    } catch {
      setAuthenticated(false);
      if (requireAuth) {
        router.push("/admin");
      }
    } finally {
      setLoading(false);
    }
  }, [requireAuth, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setAuthenticated(false);
      router.push("/");
      router.refresh();
    } catch {
      console.error("Logout failed");
    }
  };

  return { authenticated, loading, logout, checkAuth };
}
