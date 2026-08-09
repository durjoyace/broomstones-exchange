import { NextRequest, NextResponse } from "next/server";
import { getKidEquipmentByIdentity } from "@/lib/queries/kids";
import { lookupSchema } from "@/lib/validations/lookup";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = lookupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await getKidEquipmentByIdentity(
      parsed.data.child_name,
      parsed.data.parent_email
    );

    return NextResponse.json(result ? [result] : [], {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error looking up equipment:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
