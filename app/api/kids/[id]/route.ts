import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kid = await sql`
      SELECT * FROM kids WHERE id = ${id}
    `;

    if (kid.length === 0) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 });
    }

    return NextResponse.json(kid[0]);
  } catch (error) {
    console.error('Error fetching kid:', error);
    return NextResponse.json({ error: 'Failed to fetch kid' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, grade, shoe_size, parent_name, parent_email, parent_phone, notes } = body;

    const result = await sql`
      UPDATE kids
      SET name = ${name}, grade = ${grade}, shoe_size = ${shoe_size},
          parent_name = ${parent_name}, parent_email = ${parent_email},
          parent_phone = ${parent_phone}, notes = ${notes},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating kid:', error);
    return NextResponse.json({ error: 'Failed to update kid' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await sql`
      DELETE FROM kids WHERE id = ${id} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kid:', error);
    return NextResponse.json({ error: 'Failed to delete kid' }, { status: 500 });
  }
}
