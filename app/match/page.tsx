'use client';

import { useState, useEffect } from 'react';
import { Equipment, Kid } from '@/lib/db';

type KidWithCheckouts = Kid & { active_checkouts: number };

export default function MatchPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [kids, setKids] = useState<KidWithCheckouts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [checkoutModal, setCheckoutModal] = useState<{
    equipment: Equipment;
    kid: KidWithCheckouts;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, kidsRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/kids'),
      ]);
      const [equipmentData, kidsData] = await Promise.all([
        equipmentRes.json(),
        kidsRes.json(),
      ]);
      setEquipment(equipmentData);
      setKids(kidsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckout = async () => {
    if (!checkoutModal) return;
    try {
      const res = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: checkoutModal.equipment.id,
          kid_id: checkoutModal.kid.id,
          notes: `Quick match checkout - Size ${checkoutModal.equipment.size}`,
        }),
      });

      if (res.ok) {
        fetchData();
        setCheckoutModal(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to checkout');
      }
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  // Group kids by shoe size
  const kidsBySize = kids.reduce(
    (acc, kid) => {
      const size = kid.shoe_size || 'Unknown';
      if (!acc[size]) acc[size] = [];
      acc[size].push(kid);
      return acc;
    },
    {} as Record<string, KidWithCheckouts[]>
  );

  // Get available shoes by size
  const availableShoesBySize = equipment
    .filter((e) => e.type === 'shoes' && e.status === 'available')
    .reduce(
      (acc, shoe) => {
        const size = shoe.size || 'Unknown';
        if (!acc[size]) acc[size] = [];
        acc[size].push(shoe);
        return acc;
      },
      {} as Record<string, Equipment[]>
    );

  // Get all unique sizes
  const allSizes = [...new Set([...Object.keys(kidsBySize), ...Object.keys(availableShoesBySize)])]
    .filter((s) => s !== 'Unknown')
    .sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

  const filteredSizes = selectedSize ? [selectedSize] : allSizes;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Match Equipment</h1>
      </div>

      {/* Size Filter */}
      <div className="card p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Size</label>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Sizes</option>
          {allSizes.map((size) => (
            <option key={size} value={size}>
              Size {size}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Checkout</h2>
            <div className="space-y-3 mb-6">
              <p>
                <span className="font-medium">Kid:</span> {checkoutModal.kid.name}
              </p>
              <p>
                <span className="font-medium">Equipment:</span>{' '}
                {checkoutModal.equipment.type} - Size {checkoutModal.equipment.size}
                {checkoutModal.equipment.brand && ` (${checkoutModal.equipment.brand})`}
              </p>
              <p>
                <span className="font-medium">Condition:</span>{' '}
                <span className={`condition-${checkoutModal.equipment.condition}`}>
                  {checkoutModal.equipment.condition}
                </span>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCheckoutModal(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleQuickCheckout} className="btn-primary">
                Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Size Cards */}
      {filteredSizes.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No sizes to display. Add kids and equipment to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSizes.map((size) => {
            const kidsForSize = kidsBySize[size] || [];
            const availableForSize = availableShoesBySize[size] || [];
            const needsMore = kidsForSize.length > availableForSize.length;

            return (
              <div key={size} className="card overflow-hidden">
                <div
                  className={`px-6 py-4 border-b ${
                    needsMore ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Size {size}</h3>
                    <div className="flex gap-4 text-sm">
                      <span>{kidsForSize.length} kids need</span>
                      <span
                        className={`font-medium ${needsMore ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {availableForSize.length} available
                      </span>
                      {needsMore && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                          Need {kidsForSize.length - availableForSize.length} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                  {/* Kids needing this size */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Kids Needing Size {size}</h4>
                    {kidsForSize.length === 0 ? (
                      <p className="text-sm text-gray-500">No kids registered for this size</p>
                    ) : (
                      <div className="space-y-2">
                        {kidsForSize.map((kid) => (
                          <div
                            key={kid.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">{kid.name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {kid.grade || 'No grade'}
                              </span>
                            </div>
                            {Number(kid.active_checkouts) > 0 ? (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                Has equipment
                              </span>
                            ) : availableForSize.length > 0 ? (
                              <button
                                onClick={() =>
                                  setCheckoutModal({
                                    equipment: availableForSize[0],
                                    kid: kid,
                                  })
                                }
                                className="text-xs btn-primary py-1"
                              >
                                Quick Match
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">No shoes available</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available equipment */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Available Size {size} Shoes</h4>
                    {availableForSize.length === 0 ? (
                      <p className="text-sm text-gray-500">No shoes available in this size</p>
                    ) : (
                      <div className="space-y-2">
                        {availableForSize.map((shoe) => (
                          <div
                            key={shoe.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">
                                {shoe.brand || 'Unknown brand'}
                              </span>
                              <span
                                className={`text-sm ml-2 condition-${shoe.condition}`}
                              >
                                ({shoe.condition})
                              </span>
                            </div>
                            <span className="status-available px-2 py-1 rounded-full text-xs">
                              Available
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{kids.length}</div>
            <div className="text-sm text-gray-500">Total Kids</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {kids.filter((k) => k.shoe_size).length}
            </div>
            <div className="text-sm text-gray-500">With Shoe Size</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {equipment.filter((e) => e.type === 'shoes' && e.status === 'available').length}
            </div>
            <div className="text-sm text-gray-500">Available Shoes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{allSizes.length}</div>
            <div className="text-sm text-gray-500">Unique Sizes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
