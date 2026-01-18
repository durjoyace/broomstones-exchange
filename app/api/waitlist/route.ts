import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const waitlist = await sql`
      SELECT w.*, k.name as kid_name, k.parent_email
      FROM equipment_waitlist w
      JOIN kids k ON w.kid_id = k.id
      WHERE w.notified_at IS NULL
      ORDER BY w.created_at ASC
    `;
    return NextResponse.json(waitlist);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kid_id, equipment_type, size } = body;

    if (!kid_id || !equipment_type || !size) {
      return NextResponse.json(
        { error: 'Kid, equipment type, and size are required' },
        { status: 400 }
      );
    }

    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS equipment_waitlist (
        id SERIAL PRIMARY KEY,
        kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
        equipment_type VARCHAR(50) NOT NULL,
        size VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notified_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(kid_id, equipment_type, size)
      )
    `;

    // Check if already on waitlist
    const existing = await sql`
      SELECT id FROM equipment_waitlist
      WHERE kid_id = ${kid_id} AND equipment_type = ${equipment_type} AND size = ${size}
      AND notified_at IS NULL
    `;

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Already on waitlist' }, { status: 200 });
    }

    const result = await sql`
      INSERT INTO equipment_waitlist (kid_id, equipment_type, size)
      VALUES (${kid_id}, ${equipment_type}, ${size})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json({ error: 'Failed to add to waitlist' }, { status: 500 });
  }
}
