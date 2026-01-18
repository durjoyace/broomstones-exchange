'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

type Stats = {
  equipment: {
    total: number;
    available: number;
    checked_out: number;
    retired: number;
    total_shoes: number;
    total_brooms: number;
  };
  kids: {
    total: number;
  };
  checkouts: {
    active_checkouts: number;
  };
  kidsSizeDistribution: Array<{ shoe_size: string; count: number }>;
  availableShoesBySize: Array<{ size: string; count: number }>;
  availableBroomsBySize: Array<{ size: string; count: number }>;
  recentActivity: Array<{
    id: number;
    kid_name: string;
    equipment_type: string;
    equipment_size: string;
    checked_out_at: string;
    returned_at: string | null;
  }>;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { authenticated, logout } = useAuth(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/lookup?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Calculate low stock sizes (where demand > supply)
  const getLowStockSizes = () => {
    if (!stats) return [];
    return stats.kidsSizeDistribution
      .map((sizeInfo) => {
        const available =
          stats.availableShoesBySize.find((s) => s.size === sizeInfo.shoe_size)?.count || 0;
        const needed = Number(sizeInfo.count);
        if (needed > available) {
          return { size: sizeInfo.shoe_size, needed, available, shortage: needed - available };
        }
        return null;
      })
      .filter(Boolean);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Error loading dashboard</div>;
  }

  const lowStockSizes = getLowStockSizes();

  return (
    <div>
      {/* Quick Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1 text-lg py-3"
            placeholder="Search by child's name..."
          />
          <button type="submit" className="btn-primary px-6 py-3 text-lg">
            Search
          </button>
        </div>
      </form>

      {/* Low Stock Alert */}
      {lowStockSizes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-red-800 mb-2">Low Stock Alert</h3>
          <p className="text-red-700 text-sm">
            These shoe sizes are in high demand:{' '}
            {lowStockSizes.map((item, i) => (
              <span key={item!.size}>
                <strong>Size {item!.size}</strong> ({item!.available} left, {item!.shortage} short)
                {i < lowStockSizes.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Mobile-Friendly Parent Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 text-center transition-colors touch-manipulation"
        >
          <div className="text-3xl mb-2">👤</div>
          <div className="text-lg font-bold">Register My Child</div>
          <div className="text-blue-100 text-sm">First time? Start here</div>
        </Link>
        <Link
          href="/request"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-6 text-center transition-colors touch-manipulation"
        >
          <div className="text-3xl mb-2">📋</div>
          <div className="text-lg font-bold">Request Equipment</div>
          <div className="text-green-100 text-sm">Shoes or brooms</div>
        </Link>
        <Link
          href="/lookup"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 text-center transition-colors touch-manipulation"
        >
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-lg font-bold">My Equipment</div>
          <div className="text-purple-100 text-sm">What do I have?</div>
        </Link>
      </div>

      {/* Welcome Banner */}
      <div className="bg-white border-2 border-red-800 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Little Rockers Equipment Exchange</h1>
        <p className="text-gray-700 mb-4">
          Free equipment lending for kids in the Little Rockers curling program.
          Borrow <strong>shoes</strong> and <strong>brooms</strong> for the season.
        </p>

        {/* Honor System Rules */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <h2 className="font-bold text-amber-800 mb-2">Honor System Rules</h2>
          <ul className="text-amber-900 space-y-1 text-sm">
            <li>1. <strong>Return equipment at end of season</strong> - or when your child outgrows it</li>
            <li>2. <strong>Report any damage</strong> - accidents happen, just let us know</li>
            <li>3. <strong>One item per type</strong> - one pair of shoes, one broom per child</li>
            <li>4. <strong>First come, first served</strong> - check availability before each session</li>
          </ul>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 rounded-md p-4">
          <h2 className="font-bold text-gray-800 mb-2">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span><strong>Check availability</strong> below or on the Equipment page</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span><strong>Find Scott</strong> at the rink to get your equipment</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span><strong>Return it</strong> to Scott at end of season</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Questions? Contact <strong>Scott Price</strong>, Equipment Coordinator:{' '}
          <a href="mailto:Scott.Price@broomstones.org" className="text-blue-600 hover:underline">
            Scott.Price@broomstones.org
          </a>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Part of the{' '}
          <a href="https://juniors.broomstones.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Broomstones Junior Curling Program
          </a>
        </p>
      </div>

      {/* Available Equipment - For Parents */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-green-800 mb-4">Available Equipment</h2>
        <p className="text-green-700 text-sm mb-4">
          See what&apos;s available now. Email Scott to reserve items for your child.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Shoes */}
          <div className="bg-white rounded-md p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Curling Shoes</h3>
            {stats.availableShoesBySize.length === 0 ? (
              <p className="text-gray-500 text-sm">No shoes currently available</p>
            ) : (
              <div className="space-y-2">
                {stats.availableShoesBySize.map((item) => (
                  <div key={item.size} className="flex justify-between items-center">
                    <span className="text-gray-700">Size {item.size}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {item.count} available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Brooms */}
          <div className="bg-white rounded-md p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Curling Brooms</h3>
            {stats.availableBroomsBySize.length === 0 ? (
              <p className="text-gray-500 text-sm">No brooms currently available</p>
            ) : (
              <div className="space-y-2">
                {stats.availableBroomsBySize.map((item) => (
                  <div key={item.size || 'standard'} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.size || 'Standard'}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {item.count} available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-green-200">
          <Link
            href="/request"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md transition-colors"
          >
            Request Equipment
          </Link>
          <span className="text-sm text-green-700 ml-3">
            or find Scott at the rink
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.equipment.available}</div>
          <div className="text-xs text-gray-500 uppercase">Available</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.checkouts.active_checkouts}</div>
          <div className="text-xs text-gray-500 uppercase">Checked Out</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.equipment.total_shoes}</div>
          <div className="text-xs text-gray-500 uppercase">Total Shoes</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.equipment.total_brooms}</div>
          <div className="text-xs text-gray-500 uppercase">Total Brooms</div>
        </div>
      </div>

      {/* Coordinator Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between py-2">
          <span className="text-lg font-semibold text-gray-700">Coordinator Tools</span>
          {authenticated ? (
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          ) : (
            <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800">
              Login
            </Link>
          )}
        </div>

        {authenticated ? (
        <div className="mt-4 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Link
              href="/equipment"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">+</div>
              <div className="font-medium">Add Equipment</div>
            </Link>
            <Link href="/kids" className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">+</div>
              <div className="font-medium">Add Kid</div>
            </Link>
            <Link
              href="/checkouts"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">+</div>
              <div className="font-medium">Check Out Item</div>
            </Link>
            <Link
              href="/print"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">🖨️</div>
              <div className="font-medium">Print Sheet</div>
            </Link>
            <Link
              href="/waitlist"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Waitlist</div>
            </Link>
          </div>

          {/* Size Demand vs Availability */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Size Demand vs Availability</h3>
            <div className="space-y-3">
              {stats.kidsSizeDistribution.length === 0 ? (
                <p className="text-gray-500 text-sm">No kids registered with shoe sizes yet.</p>
              ) : (
                stats.kidsSizeDistribution.map((sizeInfo) => {
                  const available =
                    stats.availableShoesBySize.find((s) => s.size === sizeInfo.shoe_size)?.count || 0;
                  const needsMore = Number(sizeInfo.count) > available;
                  return (
                    <div key={sizeInfo.shoe_size} className="flex items-center justify-between">
                      <span className="font-medium">Size {sizeInfo.shoe_size}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{sizeInfo.count} kids need</span>
                        <span
                          className={`text-sm font-medium ${needsMore ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {available} available
                        </span>
                        {needsMore && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Need {Number(sizeInfo.count) - available} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity yet.</p>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <span className="font-medium">{activity.kid_name}</span>
                      <span className="text-gray-500 mx-2">
                        {activity.returned_at ? 'returned' : 'checked out'}
                      </span>
                      <span className="capitalize">
                        {activity.equipment_type} (Size {activity.equipment_size || 'N/A'})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(activity.returned_at || activity.checked_out_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/checkouts" className="text-sm text-blue-600 hover:text-blue-800">
                View all checkouts
              </Link>
            </div>
          </div>
        </div>
        ) : (
          <div className="mt-4 card p-6 text-center">
            <p className="text-gray-600 mb-4">Log in to access coordinator tools.</p>
            <Link href="/admin" className="btn-primary">
              Coordinator Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
