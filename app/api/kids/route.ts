import { NextRequest, NextResponse } from "next/server";
import { getAllKids, createKid } from "@/lib/queries/kids";
import { kidSchema } from "@/lib/validations/kid";

export async function GET() {
  try {
    const kids = await getAllKids();
    return NextResponse.json(kids);
  } catch (error) {
    console.error("Error fetching kids:", error);
    return NextResponse.json({ error: "Failed to fetch kids" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = kidSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, grade, shoe_size, parent_name, parent_email, parent_phone, notes } =
      parsed.data;

    const kid = await createKid({
      name,
      grade: grade || null,
      shoeSize: shoe_size || null,
      parentName: parent_name || null,
      parentEmail: parent_email || null,
      parentPhone: parent_phone || null,
      notes: notes || null,
    });

    return NextResponse.json(kid, { status: 201 });
  } catch (error) {
    console.error("Error creating kid:", error);
    return NextResponse.json({ error: "Failed to create kid" }, { status: 500 });
  }
}
