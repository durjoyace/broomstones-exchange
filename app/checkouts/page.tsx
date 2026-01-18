'use client';

import { useState, useEffect } from 'react';
import { Equipment, Kid, CheckoutWithDetails } from '@/lib/db';

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<CheckoutWithDetails[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkReturning, setBulkReturning] = useState(false);
  const [formData, setFormData] = useState({
    equipment_id: '',
    kid_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [checkoutsRes, equipmentRes, kidsRes] = await Promise.all([
        fetch('/api/checkouts?active=true'),
        fetch('/api/equipment'),
        fetch('/api/kids'),
      ]);
      const [checkoutsData, equipmentData, kidsData] = await Promise.all([
        checkoutsRes.json(),
        equipmentRes.json(),
        kidsRes.json(),
      ]);
      setCheckouts(checkoutsData);
      setEquipment(equipmentData);
      setKids(kidsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCheckouts = async () => {
    try {
      const res = await fetch('/api/checkouts');
      const data = await res.json();
      setCheckouts(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching checkouts:', error);
    }
  };

  const fetchActiveCheckouts = async () => {
    try {
      const res = await fetch('/api/checkouts?active=true');
      const data = await res.json();
      setCheckouts(data);
      setShowHistory(false);
    } catch (error) {
      console.error('Error fetching checkouts:', error);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: parseInt(formData.equipment_id),
          kid_id: parseInt(formData.kid_id),
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        fetchData();
        setShowForm(false);
        setFormData({ equipment_id: '', kid_id: '', notes: '' });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to checkout');
      }
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handleReturn = async (checkoutId: number) => {
    try {
      const res = await fetch(`/api/checkouts/${checkoutId}/return`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchData();
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(checkoutId);
          return next;
        });
      }
    } catch (error) {
      console.error('Error returning:', error);
    }
  };

  const handleBulkReturn = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = confirm(`Return ${selectedIds.size} item(s)?`);
    if (!confirmed) return;

    setBulkReturning(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/checkouts/${id}/return`, { method: 'POST' })
        )
      );
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error('Error bulk returning:', error);
    } finally {
      setBulkReturning(false);
    }
  };

  const handleReturnAll = async () => {
    if (checkouts.length === 0) return;

    const confirmed = confirm(`Return ALL ${checkouts.length} checked out items? This is typically done at end of season.`);
    if (!confirmed) return;

    setBulkReturning(true);
    try {
      await Promise.all(
        checkouts.map((c) =>
          fetch(`/api/checkouts/${c.id}/return`, { method: 'POST' })
        )
      );
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error('Error returning all:', error);
    } finally {
      setBulkReturning(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === checkouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(checkouts.map((c) => c.id)));
    }
  };

  const availableEquipment = equipment.filter((e) => e.status === 'available');

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkouts</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Check Out Equipment
        </button>
      </div>

      {/* Toggle Active/History */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <button
          onClick={fetchActiveCheckouts}
          className={`px-4 py-2 rounded-md font-medium ${
            !showHistory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Checkouts
        </button>
        <button
          onClick={fetchAllCheckouts}
          className={`px-4 py-2 rounded-md font-medium ${
            showHistory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All History
        </button>

        {!showHistory && checkouts.length > 0 && (
          <>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkReturn}
                disabled={bulkReturning}
                className="px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {bulkReturning ? 'Returning...' : `Return Selected (${selectedIds.size})`}
              </button>
            )}
            <button
              onClick={handleReturnAll}
              disabled={bulkReturning}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Return All
            </button>
          </>
        )}
      </div>

      {/* Checkout Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Check Out Equipment</h2>
            <form onSubmit={handleCheckout}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.equipment_id}
                    onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select equipment...</option>
                    {availableEquipment.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.type} - Size {e.size || 'N/A'} {e.brand ? `(${e.brand})` : ''}
                      </option>
                    ))}
                  </select>
                  {availableEquipment.length === 0 && (
                    <p className="text-sm text-orange-600 mt-1">No available equipment</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kid <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kid_id}
                    onChange={(e) => setFormData({ ...formData, kid_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select kid...</option>
                    {kids.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} {k.shoe_size ? `(Size ${k.shoe_size})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Any notes about this checkout..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={availableEquipment.length === 0}
                >
                  Check Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkouts List */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="table-header">
              {!showHistory && (
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={checkouts.length > 0 && selectedIds.size === checkouts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left">Kid</th>
              <th className="px-6 py-3 text-left">Equipment</th>
              <th className="px-6 py-3 text-left">Size</th>
              <th className="px-6 py-3 text-left">Checked Out</th>
              {showHistory && <th className="px-6 py-3 text-left">Returned</th>}
              <th className="px-6 py-3 text-left">Notes</th>
              {!showHistory && <th className="px-6 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {checkouts.length === 0 ? (
              <tr>
                <td colSpan={showHistory ? 6 : 8} className="px-6 py-8 text-center text-gray-500">
                  {showHistory ? 'No checkout history yet.' : 'No active checkouts.'}
                </td>
              </tr>
            ) : (
              checkouts.map((checkout) => (
                <tr key={checkout.id} className={`hover:bg-gray-50 ${selectedIds.has(checkout.id) ? 'bg-blue-50' : ''}`}>
                  {!showHistory && (
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(checkout.id)}
                        onChange={() => toggleSelect(checkout.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-medium">{checkout.kid_name}</td>
                  <td className="px-6 py-4 capitalize">
                    {checkout.equipment_type}
                    {checkout.equipment_brand && (
                      <span className="text-gray-500 text-sm ml-1">({checkout.equipment_brand})</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{checkout.equipment_size || '-'}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(checkout.checked_out_at)}</td>
                  {showHistory && (
                    <td className="px-6 py-4 text-sm">
                      {checkout.returned_at ? (
                        formatDate(checkout.returned_at)
                      ) : (
                        <span className="status-checked-out px-2 py-1 rounded-full text-xs">
                          Still out
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {checkout.notes || '-'}
                  </td>
                  {!showHistory && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReturn(checkout.id)}
                        className="btn-secondary text-sm"
                      >
                        Return
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {showHistory ? `${checkouts.length} total checkouts` : `${checkouts.length} active checkouts`}
      </div>
    </div>
  );
}
