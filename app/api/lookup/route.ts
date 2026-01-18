import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Find kids matching the search term
    const kids = await sql`
      SELECT id, name, shoe_size
      FROM kids
      WHERE LOWER(name) LIKE LOWER(${'%' + query + '%'})
      ORDER BY name
      LIMIT 10
    `;

    // Get active checkouts for each kid
    const results = await Promise.all(
      kids.map(async (kid) => {
        const checkouts = await sql`
          SELECT c.id, c.checked_out_at, e.type as equipment_type, e.size as equipment_size, e.brand as equipment_brand
          FROM checkouts c
          JOIN equipment e ON c.equipment_id = e.id
          WHERE c.kid_id = ${kid.id} AND c.returned_at IS NULL
          ORDER BY c.checked_out_at DESC
        `;
        return {
          ...kid,
          checkouts,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching kids:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
