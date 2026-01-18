'use client';

import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, logout } = useAuth(true);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
        <Link href="/admin" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
