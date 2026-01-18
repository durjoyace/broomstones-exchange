import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get equipment stats
    const equipmentStats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'checked_out') as checked_out,
        COUNT(*) FILTER (WHERE status = 'retired') as retired,
        COUNT(*) FILTER (WHERE type = 'shoes') as total_shoes,
        COUNT(*) FILTER (WHERE type = 'broom') as total_brooms
      FROM equipment
    `;

    // Get kids stats
    const kidsStats = await sql`
      SELECT COUNT(*) as total FROM kids
    `;

    // Get active checkouts
    const checkoutStats = await sql`
      SELECT COUNT(*) as active_checkouts
      FROM checkouts
      WHERE returned_at IS NULL
    `;

    // Get shoe size distribution (kids)
    const kidsSizeDistribution = await sql`
      SELECT shoe_size, COUNT(*) as count
      FROM kids
      WHERE shoe_size IS NOT NULL AND shoe_size != ''
      GROUP BY shoe_size
      ORDER BY shoe_size
    `;

    // Get available shoes by size
    const availableShoesBySize = await sql`
      SELECT size, COUNT(*) as count
      FROM equipment
      WHERE type = 'shoes' AND status = 'available' AND size IS NOT NULL
      GROUP BY size
      ORDER BY size
    `;

    // Get available brooms by size
    const availableBroomsBySize = await sql`
      SELECT size, COUNT(*) as count
      FROM equipment
      WHERE type = 'broom' AND status = 'available'
      GROUP BY size
      ORDER BY size
    `;

    // Get recent activity
    const recentActivity = await sql`
      SELECT c.*, k.name as kid_name, e.type as equipment_type, e.size as equipment_size
      FROM checkouts c
      JOIN kids k ON c.kid_id = k.id
      JOIN equipment e ON c.equipment_id = e.id
      ORDER BY COALESCE(c.returned_at, c.checked_out_at) DESC
      LIMIT 10
    `;

    return NextResponse.json({
      equipment: equipmentStats[0],
      kids: kidsStats[0],
      checkouts: checkoutStats[0],
      kidsSizeDistribution,
      availableShoesBySize,
      availableBroomsBySize,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
