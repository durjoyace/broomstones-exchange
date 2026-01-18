'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type CheckoutInfo = {
  id: number;
  equipment_type: string;
  equipment_size: string | null;
  equipment_brand: string | null;
  checked_out_at: string;
};

type KidInfo = {
  id: number;
  name: string;
  shoe_size: string | null;
  checkouts: CheckoutInfo[];
};

function LookupContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<KidInfo[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Equipment</h1>
      <p className="text-gray-600 mb-6">
        Look up what equipment your child currently has checked out.
      </p>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
            placeholder="Enter child's name..."
            autoFocus
          />
          <button type="submit" className="btn-primary px-6" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searched && results.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">No results found for &quot;{searchTerm}&quot;</p>
          <p className="text-sm text-gray-400">
            If your child isn&apos;t registered yet,{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              register them here
            </Link>
            .
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((kid) => (
            <div key={kid.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{kid.name}</h2>
                  {kid.shoe_size && (
                    <p className="text-sm text-gray-500">Shoe size: {kid.shoe_size}</p>
                  )}
                </div>
                {kid.checkouts.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                    {kid.checkouts.length} item{kid.checkouts.length > 1 ? 's' : ''} out
                  </span>
                )}
              </div>

              {kid.checkouts.length === 0 ? (
                <p className="text-gray-500 text-sm">No equipment currently checked out.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Currently has:</p>
                  {kid.checkouts.map((checkout) => (
                    <div
                      key={checkout.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded"
                    >
                      <div>
                        <span className="font-medium capitalize">{checkout.equipment_type}</span>
                        {checkout.equipment_size && (
                          <span className="text-gray-500"> - Size {checkout.equipment_size}</span>
                        )}
                        {checkout.equipment_brand && (
                          <span className="text-gray-400 text-sm ml-2">
                            ({checkout.equipment_brand})
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        Since {formatDate(checkout.checked_out_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                To return equipment, bring it to Scott at the rink.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <LookupContent />
    </Suspense>
  );
}
