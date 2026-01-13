import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const kids = await sql`
      SELECT k.*,
        (SELECT COUNT(*) FROM checkouts c WHERE c.kid_id = k.id AND c.returned_at IS NULL) as active_checkouts
      FROM kids k
      ORDER BY k.name ASC
    `;
    return NextResponse.json(kids);
  } catch (error) {
    console.error('Error fetching kids:', error);
    return NextResponse.json({ error: 'Failed to fetch kids' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, grade, shoe_size, parent_name, parent_email, parent_phone, notes } = body;

    const result = await sql`
      INSERT INTO kids (name, grade, shoe_size, parent_name, parent_email, parent_phone, notes)
      VALUES (${name}, ${grade}, ${shoe_size}, ${parent_name}, ${parent_email}, ${parent_phone}, ${notes})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating kid:', error);
    return NextResponse.json({ error: 'Failed to create kid' }, { status: 500 });
  }
}
