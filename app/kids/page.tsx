'use client';

import { useState, useEffect } from 'react';
import { Kid } from '@/lib/db';

type KidFormData = {
  name: string;
  grade: string;
  shoe_size: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  notes: string;
};

const initialFormData: KidFormData = {
  name: '',
  grade: '',
  shoe_size: '',
  parent_name: '',
  parent_email: '',
  parent_phone: '',
  notes: '',
};

type KidWithCheckouts = Kid & { active_checkouts: number };

export default function KidsPage() {
  const [kids, setKids] = useState<KidWithCheckouts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<KidFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchKids();
  }, []);

  const fetchKids = async () => {
    try {
      const res = await fetch('/api/kids');
      const data = await res.json();
      setKids(data);
    } catch (error) {
      console.error('Error fetching kids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/kids/${editingId}` : '/api/kids';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchKids();
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error saving kid:', error);
    }
  };

  const handleEdit = (kid: KidWithCheckouts) => {
    setFormData({
      name: kid.name,
      grade: kid.grade || '',
      shoe_size: kid.shoe_size || '',
      parent_name: kid.parent_name || '',
      parent_email: kid.parent_email || '',
      parent_phone: kid.parent_phone || '',
      notes: kid.notes || '',
    });
    setEditingId(kid.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this kid? This will also delete their checkout history.')) return;
    try {
      const res = await fetch(`/api/kids/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKids();
      }
    } catch (error) {
      console.error('Error deleting kid:', error);
    }
  };

  const filteredKids = kids.filter(
    (kid) =>
      kid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kid.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kid.shoe_size?.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Little Rockers</h1>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Add Kid
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, parent, or shoe size..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Kid Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Kid' : 'Add Kid'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select grade</option>
                      <option value="1st">1st Grade</option>
                      <option value="2nd">2nd Grade</option>
                      <option value="3rd">3rd Grade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shoe Size</label>
                    <input
                      type="text"
                      value={formData.shoe_size}
                      onChange={(e) => setFormData({ ...formData, shoe_size: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 5, 6, 7"
                    />
                  </div>
                </div>
                <hr className="my-2" />
                <p className="text-sm text-gray-500">Parent/Guardian Contact</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Any special considerations..."
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
                  {editingId ? 'Save Changes' : 'Add Kid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kids Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKids.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 card">
            No kids found. Add some Little Rockers to get started.
          </div>
        ) : (
          filteredKids.map((kid) => (
            <div key={kid.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{kid.name}</h3>
                {Number(kid.active_checkouts) > 0 && (
                  <span className="status-checked-out px-2 py-1 rounded-full text-xs">
                    {kid.active_checkouts} checked out
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Grade:</span> {kid.grade || '-'}
                </p>
                <p>
                  <span className="font-medium">Shoe Size:</span> {kid.shoe_size || '-'}
                </p>
                {kid.parent_name && (
                  <p>
                    <span className="font-medium">Parent:</span> {kid.parent_name}
                  </p>
                )}
                {kid.parent_email && (
                  <p className="truncate">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${kid.parent_email}`} className="text-blue-600 hover:underline">
                      {kid.parent_email}
                    </a>
                  </p>
                )}
                {kid.parent_phone && (
                  <p>
                    <span className="font-medium">Phone:</span> {kid.parent_phone}
                  </p>
                )}
                {kid.notes && (
                  <p className="text-gray-500 italic truncate">Note: {kid.notes}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleEdit(kid)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(kid.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredKids.length} of {kids.length} Little Rockers
      </div>
    </div>
  );
}
