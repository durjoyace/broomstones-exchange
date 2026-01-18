'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth: boolean = true) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setAuthenticated(data.authenticated);

      if (requireAuth && !data.authenticated) {
        router.push('/admin');
      }
    } catch {
      setAuthenticated(false);
      if (requireAuth) {
        router.push('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setAuthenticated(false);
      router.push('/');
      router.refresh();
    } catch {
      console.error('Logout failed');
    }
  };

  return { authenticated, loading, logout, checkAuth };
}
