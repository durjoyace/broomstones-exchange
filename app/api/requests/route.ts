import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const requests = await sql`
      SELECT r.*, k.name as kid_name, k.shoe_size as kid_shoe_size
      FROM equipment_requests r
      JOIN kids k ON r.kid_id = k.id
      ORDER BY r.created_at DESC
    `;
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kid_id, equipment_type, size, notes } = body;

    if (!kid_id || !equipment_type || !size) {
      return NextResponse.json(
        { error: 'Kid, equipment type, and size are required' },
        { status: 400 }
      );
    }

    // Check if table exists, create if not
    await sql`
      CREATE TABLE IF NOT EXISTS equipment_requests (
        id SERIAL PRIMARY KEY,
        kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
        equipment_type VARCHAR(50) NOT NULL,
        size VARCHAR(20) NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fulfilled_at TIMESTAMP WITH TIME ZONE
      )
    `;

    const result = await sql`
      INSERT INTO equipment_requests (kid_id, equipment_type, size, notes)
      VALUES (${kid_id}, ${equipment_type}, ${size}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
