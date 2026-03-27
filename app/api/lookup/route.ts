import { NextRequest, NextResponse } from "next/server";
import { searchKids } from "@/lib/queries/kids";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await searchKids(query.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching kids:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
