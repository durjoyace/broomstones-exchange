'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Error loading dashboard</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Equipment
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats.equipment.total}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({stats.equipment.total_shoes} shoes, {stats.equipment.total_brooms} brooms)
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-green-600">{stats.equipment.available}</span>
            <span className="ml-2 text-sm text-gray-500">ready to use</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Checked Out</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-orange-600">{stats.checkouts.active_checkouts}</span>
            <span className="ml-2 text-sm text-gray-500">active loans</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Little Rockers
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats.kids.total}</span>
            <span className="ml-2 text-sm text-gray-500">registered kids</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Size Demand vs Availability */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Size Demand vs Availability</h2>
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
          <div className="mt-4 pt-4 border-t">
            <Link href="/match" className="text-sm text-blue-600 hover:text-blue-800">
              View full matching details
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
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

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <div className="text-2xl mb-2">-&gt;</div>
            <div className="font-medium">Check Out</div>
          </Link>
          <Link href="/match" className="card p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">*</div>
            <div className="font-medium">Match Sizes</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
