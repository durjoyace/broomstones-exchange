import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let checkouts;
    if (activeOnly) {
      checkouts = await sql`
        SELECT c.*, k.name as kid_name, e.type as equipment_type,
               e.size as equipment_size, e.brand as equipment_brand
        FROM checkouts c
        JOIN kids k ON c.kid_id = k.id
        JOIN equipment e ON c.equipment_id = e.id
        WHERE c.returned_at IS NULL
        ORDER BY c.checked_out_at DESC
      `;
    } else {
      checkouts = await sql`
        SELECT c.*, k.name as kid_name, e.type as equipment_type,
               e.size as equipment_size, e.brand as equipment_brand
        FROM checkouts c
        JOIN kids k ON c.kid_id = k.id
        JOIN equipment e ON c.equipment_id = e.id
        ORDER BY c.checked_out_at DESC
      `;
    }

    return NextResponse.json(checkouts);
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    return NextResponse.json({ error: 'Failed to fetch checkouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { equipment_id, kid_id, notes } = body;

    // Check if equipment is available
    const equipment = await sql`
      SELECT status FROM equipment WHERE id = ${equipment_id}
    `;

    if (equipment.length === 0) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    if (equipment[0].status !== 'available') {
      return NextResponse.json({ error: 'Equipment is not available' }, { status: 400 });
    }

    // Create checkout and update equipment status
    const result = await sql`
      INSERT INTO checkouts (equipment_id, kid_id, notes)
      VALUES (${equipment_id}, ${kid_id}, ${notes})
      RETURNING *
    `;

    await sql`
      UPDATE equipment SET status = 'checked_out', updated_at = NOW()
      WHERE id = ${equipment_id}
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
