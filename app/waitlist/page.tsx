'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedPage from '@/app/components/ProtectedPage';

type WaitlistEntry = {
  id: number;
  kid_id: number;
  kid_name: string;
  parent_email: string;
  equipment_type: string;
  size: string;
  created_at: string;
};

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await fetch('/api/waitlist');
      const data = await res.json();
      setWaitlist(data);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group by equipment type and size
  const groupedWaitlist = waitlist.reduce(
    (acc, entry) => {
      const key = `${entry.equipment_type}-${entry.size}`;
      if (!acc[key]) {
        acc[key] = {
          type: entry.equipment_type,
          size: entry.size,
          entries: [],
        };
      }
      acc[key].entries.push(entry);
      return acc;
    },
    {} as Record<string, { type: string; size: string; entries: WaitlistEntry[] }>
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <ProtectedPage>
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist</h1>
          <p className="text-gray-600 text-sm">Kids waiting for equipment that&apos;s out of stock</p>
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>

      {waitlist.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No one is currently on the waitlist.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedWaitlist).map((group) => (
            <div key={`${group.type}-${group.size}`} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold capitalize">
                  {group.type} - Size {group.size}
                </h2>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {group.entries.length} waiting
                </span>
              </div>

              <div className="space-y-2">
                {group.entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                      <div>
                        <span className="font-medium">{entry.kid_name}</span>
                        {entry.parent_email && (
                          <a
                            href={`mailto:${entry.parent_email}?subject=Equipment%20Available%20-%20${group.type}%20Size%20${group.size}`}
                            className="text-blue-600 hover:underline text-sm ml-2"
                          >
                            Email
                          </a>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      Since {formatDate(entry.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        Total: {waitlist.length} kid{waitlist.length !== 1 ? 's' : ''} on waitlist
      </div>
    </div>
    </ProtectedPage>
  );
}
