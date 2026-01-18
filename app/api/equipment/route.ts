import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const equipment = await sql`
      SELECT * FROM equipment
      ORDER BY created_at DESC
    `;
    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, size, brand, condition, notes, photo_url } = body;

    // Ensure photo_url column exists (migration)
    await sql`
      ALTER TABLE equipment ADD COLUMN IF NOT EXISTS photo_url TEXT
    `;

    const result = await sql`
      INSERT INTO equipment (type, size, brand, condition, status, notes, photo_url)
      VALUES (${type}, ${size}, ${brand}, ${condition || 'good'}, 'available', ${notes}, ${photo_url || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}
