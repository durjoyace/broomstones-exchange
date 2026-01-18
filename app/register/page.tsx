'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    shoe_size: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/kids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to register. Please try again.');
      }
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Registration Complete!</h1>
          <p className="text-green-700 mb-6">
            <strong>{formData.name}</strong> has been registered for the equipment exchange program.
          </p>
          <p className="text-sm text-green-600 mb-6">
            You can now request equipment by contacting Scott at the rink or through the{' '}
            <Link href="/request" className="underline">request form</Link>.
          </p>
          <div className="space-y-2">
            <Link href="/request" className="btn-primary block">
              Request Equipment
            </Link>
            <Link href="/" className="block text-gray-600 hover:text-gray-800">
              ← Back to Home
            </Link>
          </div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Register Your Child</h1>
        <p className="text-gray-600 text-sm mb-6">
          Add your child to the Little Rockers equipment exchange program.
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
                Child&apos;s Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
                placeholder="First and last name"
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
                  <option value="">Select...</option>
                  <option value="K">Kindergarten</option>
                  <option value="1st">1st Grade</option>
                  <option value="2nd">2nd Grade</option>
                  <option value="3rd">3rd Grade</option>
                  <option value="4th">4th Grade</option>
                  <option value="5th">5th Grade</option>
                  <option value="6th+">6th Grade+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shoe Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shoe_size}
                  onChange={(e) => setFormData({ ...formData, shoe_size: e.target.value })}
                  className="input-field"
                  required
                  placeholder="e.g., 3, 4, 5"
                />
              </div>
            </div>

            <hr className="my-4" />
            <p className="text-sm font-medium text-gray-700">Parent/Guardian Contact</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.parent_email}
                onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                className="input-field"
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="input-field"
                placeholder="Optional"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-6 py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register My Child'}
          </button>
        </form>
      </div>
    </div>
  );
}
