'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedPage from '@/app/components/ProtectedPage';

type Checkout = {
  id: number;
  kid_name: string;
  equipment_type: string;
  equipment_size: string | null;
  equipment_brand: string | null;
  checked_out_at: string;
};

type Equipment = {
  id: number;
  type: string;
  size: string | null;
  brand: string | null;
  status: string;
  condition: string;
};

export default function PrintPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'checkouts' | 'inventory'>('checkouts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [checkoutsRes, equipmentRes] = await Promise.all([
        fetch('/api/checkouts?active=true'),
        fetch('/api/equipment'),
      ]);
      const [checkoutsData, equipmentData] = await Promise.all([
        checkoutsRes.json(),
        equipmentRes.json(),
      ]);
      setCheckouts(checkoutsData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const availableEquipment = equipment.filter((e) => e.status === 'available');
  const checkedOutEquipment = equipment.filter((e) => e.status === 'checked_out');

  return (
    <ProtectedPage>
    <div>
      {/* Screen-only controls */}
      <div className="print:hidden mb-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
          <button onClick={handlePrint} className="btn-primary">
            Print This Page
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setView('checkouts')}
            className={`px-4 py-2 rounded-md font-medium ${
              view === 'checkouts'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Checkouts
          </button>
          <button
            onClick={() => setView('inventory')}
            className={`px-4 py-2 rounded-md font-medium ${
              view === 'inventory'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Full Inventory
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print:p-0">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Broomstones Equipment Exchange</h1>
          <p className="text-gray-500">
            {view === 'checkouts' ? 'Active Checkouts' : 'Equipment Inventory'} -{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {view === 'checkouts' ? (
          <>
            {checkouts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active checkouts</p>
            ) : (
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Kid</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Equipment</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Size</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Since</th>
                    <th className="border border-gray-300 px-3 py-2 text-center print:hidden">
                      Returned?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checkouts.map((checkout) => (
                    <tr key={checkout.id}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        {checkout.kid_name}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 capitalize">
                        {checkout.equipment_type}
                        {checkout.equipment_brand && (
                          <span className="text-gray-500 text-xs ml-1">
                            ({checkout.equipment_brand})
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {checkout.equipment_size || '-'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {formatDate(checkout.checked_out_at)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center print:hidden">
                        <div className="w-6 h-6 border-2 border-gray-400 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Total: {checkouts.length} active checkout{checkouts.length !== 1 ? 's' : ''}
            </p>
          </>
        ) : (
          <>
            <h2 className="font-bold text-lg mb-2 mt-6">Available ({availableEquipment.length})</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
              <thead>
                <tr className="bg-green-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Size</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Brand</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Condition</th>
                </tr>
              </thead>
              <tbody>
                {availableEquipment.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-3 py-2 capitalize">{item.type}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.size || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.brand || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 capitalize">{item.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="font-bold text-lg mb-2">Checked Out ({checkedOutEquipment.length})</h2>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-orange-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Size</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Brand</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Condition</th>
                </tr>
              </thead>
              <tbody>
                {checkedOutEquipment.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-3 py-2 capitalize">{item.type}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.size || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.brand || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 capitalize">{item.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
    </ProtectedPage>
  );
}
