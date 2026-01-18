'use client';

import { useState, useEffect } from 'react';
import { Equipment } from '@/lib/db';
import ProtectedPage from '@/app/components/ProtectedPage';

type EquipmentFormData = {
  type: 'shoes' | 'broom';
  size: string;
  brand: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'checked_out' | 'retired';
  notes: string;
  photo_url: string;
};

const initialFormData: EquipmentFormData = {
  type: 'shoes',
  size: '',
  brand: '',
  condition: 'good',
  status: 'available',
  notes: '',
  photo_url: '',
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EquipmentFormData>(initialFormData);
  const [filter, setFilter] = useState({ type: '', status: '', size: '' });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/equipment/${editingId}` : '/api/equipment';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchEquipment();
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const handleEdit = (item: Equipment) => {
    setFormData({
      type: item.type,
      size: item.size || '',
      brand: item.brand || '',
      condition: item.condition,
      status: item.status,
      notes: item.notes || '',
      photo_url: item.photo_url || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEquipment();
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    if (filter.type && item.type !== filter.type) return false;
    if (filter.status && item.status !== filter.status) return false;
    if (filter.size && item.size !== filter.size) return false;
    return true;
  });

  const uniqueSizes = [...new Set(equipment.map((e) => e.size).filter(Boolean))].sort();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <ProtectedPage>
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Add Equipment
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="shoes">Shoes</option>
              <option value="broom">Brooms</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="checked_out">Checked Out</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <select
              value={filter.size}
              onChange={(e) => setFilter({ ...filter, size: e.target.value })}
              className="input-field"
            >
              <option value="">All Sizes</option>
              {uniqueSizes.map((size) => (
                <option key={size} value={size!}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Equipment' : 'Add Equipment'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'shoes' | 'broom' })
                    }
                    className="input-field"
                    required
                  >
                    <option value="shoes">Shoes</option>
                    <option value="broom">Broom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="input-field"
                    placeholder={formData.type === 'shoes' ? 'e.g., 5, 6, 7' : 'e.g., Junior, Adult'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input-field"
                    placeholder="e.g., BalancePlus, Asham"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condition: e.target.value as EquipmentFormData['condition'],
                      })
                    }
                    className="input-field"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as EquipmentFormData['status'],
                        })
                      }
                      className="input-field"
                    >
                      <option value="available">Available</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/photo.jpg"
                  />
                  {formData.photo_url && (
                    <div className="mt-2">
                      <img
                        src={formData.photo_url}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded border"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save Changes' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 text-left w-16">Photo</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Size</th>
              <th className="px-6 py-3 text-left">Brand</th>
              <th className="px-6 py-3 text-left">Condition</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Notes</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No equipment found. Add some equipment to get started.
                </td>
              </tr>
            ) : (
              filteredEquipment.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        alt={`${item.type} ${item.size || ''}`}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize">{item.type}</td>
                  <td className="px-6 py-4">{item.size || '-'}</td>
                  <td className="px-6 py-4">{item.brand || '-'}</td>
                  <td className={`px-6 py-4 capitalize condition-${item.condition}`}>
                    {item.condition}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium status-${item.status.replace('_', '-')}`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {item.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredEquipment.length} of {equipment.length} items
      </div>
    </div>
    </ProtectedPage>
  );
}
