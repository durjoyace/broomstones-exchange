import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the checkout
    const checkout = await sql`
      SELECT * FROM checkouts WHERE id = ${id} AND returned_at IS NULL
    `;

    if (checkout.length === 0) {
      return NextResponse.json({ error: 'Active checkout not found' }, { status: 404 });
    }

    // Mark as returned
    const result = await sql`
      UPDATE checkouts
      SET returned_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Update equipment status to available
    await sql`
      UPDATE equipment SET status = 'available', updated_at = NOW()
      WHERE id = ${checkout[0].equipment_id}
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error returning equipment:', error);
    return NextResponse.json({ error: 'Failed to return equipment' }, { status: 500 });
  }
}
