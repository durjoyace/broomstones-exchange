import { NextRequest, NextResponse } from "next/server";
import { getAllEquipment, createEquipment } from "@/lib/queries/equipment";
import { equipmentSchema } from "@/lib/validations/equipment";

export async function GET() {
  try {
    const items = await getAllEquipment();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = equipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, size, brand, condition, notes, photo_url } = parsed.data;

    const item = await createEquipment({
      type,
      size: size || null,
      brand: brand || null,
      condition: condition || "good",
      notes: notes || null,
      photoUrl: photo_url || null,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 });
  }
}
