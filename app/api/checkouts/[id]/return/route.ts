import { NextRequest, NextResponse } from "next/server";
import { returnCheckout } from "@/lib/queries/checkouts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await returnCheckout(Number(id));

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.checkout);
  } catch (error) {
    console.error("Error returning equipment:", error);
    return NextResponse.json({ error: "Failed to return equipment" }, { status: 500 });
  }
}
