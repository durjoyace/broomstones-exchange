'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Kid = {
  id: number;
  name: string;
  shoe_size: string | null;
};

type AvailableEquipment = {
  shoes: Array<{ size: string; count: number }>;
  brooms: Array<{ size: string; count: number }>;
};

export default function RequestPage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [available, setAvailable] = useState<AvailableEquipment>({ shoes: [], brooms: [] });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    kid_id: '',
    equipment_type: 'shoes',
    size: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kidsRes, statsRes] = await Promise.all([
        fetch('/api/kids'),
        fetch('/api/stats'),
      ]);
      const [kidsData, statsData] = await Promise.all([kidsRes.json(), statsRes.json()]);
      setKids(kidsData);
      setAvailable({
        shoes: statsData.availableShoesBySize || [],
        brooms: statsData.availableBroomsBySize || [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit request');
      }
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!formData.kid_id || !formData.size) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kid_id: parseInt(formData.kid_id),
          equipment_type: formData.equipment_type,
          size: formData.size,
        }),
      });

      if (res.ok) {
        setJoinedWaitlist(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join waitlist');
      }
    } catch {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedKid = kids.find((k) => k.id === parseInt(formData.kid_id));
  const availableSizes =
    formData.equipment_type === 'shoes' ? available.shoes : available.brooms;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (joinedWaitlist) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Added to Waitlist!</h1>
          <p className="text-blue-700 mb-6">
            We&apos;ll notify you when {formData.equipment_type} size {formData.size} becomes available.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Request Submitted!</h1>
          <p className="text-green-700 mb-6">
            Scott will prepare your equipment. Pick it up at the next session.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Home
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Equipment</h1>
        <p className="text-gray-600 text-sm mb-6">
          Request shoes or a broom for your child. Scott will have it ready at the next session.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Child <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kid_id}
                onChange={(e) => setFormData({ ...formData, kid_id: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Choose...</option>
                {kids.map((kid) => (
                  <option key={kid.id} value={kid.id}>
                    {kid.name} {kid.shoe_size ? `(Size ${kid.shoe_size})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Don&apos;t see your child?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Register them first
                </Link>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, equipment_type: 'shoes', size: '' })}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    formData.equipment_type === 'shoes'
                      ? 'border-red-800 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👟</div>
                  <div className="font-medium">Shoes</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, equipment_type: 'broom', size: '' })}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    formData.equipment_type === 'broom'
                      ? 'border-red-800 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🧹</div>
                  <div className="font-medium">Broom</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size <span className="text-red-500">*</span>
              </label>
              {availableSizes.length === 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="text-orange-700 text-sm mb-2">
                    No {formData.equipment_type} currently available.
                  </p>
                  <p className="text-orange-600 text-xs">
                    Enter a size below and join the waitlist to be notified.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => setFormData({ ...formData, size: item.size })}
                      className={`p-2 rounded border text-center transition-colors ${
                        formData.size === item.size
                          ? 'border-red-800 bg-red-50 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{item.size || 'Std'}</div>
                      <div className="text-xs text-green-600">{item.count} avail</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedKid?.shoe_size && formData.equipment_type === 'shoes' && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedKid.name}&apos;s registered shoe size: {selectedKid.shoe_size}
                </p>
              )}
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="input-field mt-2"
                placeholder="Or type a size if not listed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Any special requests..."
              />
            </div>
          </div>

          {availableSizes.length > 0 ? (
            <button
              type="submit"
              className="btn-primary w-full mt-6 py-3 text-lg"
              disabled={submitting || !formData.kid_id || !formData.size}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleJoinWaitlist}
              className="w-full mt-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              disabled={submitting || !formData.kid_id || !formData.size}
            >
              {submitting ? 'Joining...' : 'Join Waitlist'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
