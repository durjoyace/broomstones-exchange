import { NextRequest, NextResponse } from "next/server";
import { getCheckouts, createCheckout } from "@/lib/queries/checkouts";
import { checkoutSchema } from "@/lib/validations/checkout";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") !== "false";
    const items = await getCheckouts(activeOnly);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching checkouts:", error);
    return NextResponse.json({ error: "Failed to fetch checkouts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { equipment_id, kid_id, notes } = parsed.data;

    const result = await createCheckout({
      equipmentId: equipment_id,
      kidId: kid_id,
      notes: notes || undefined,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.checkout, { status: 201 });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
