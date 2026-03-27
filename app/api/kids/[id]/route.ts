import { NextRequest, NextResponse } from "next/server";
import { getKidById, updateKid, softDeleteKid } from "@/lib/queries/kids";
import { kidSchema } from "@/lib/validations/kid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kid = await getKidById(Number(id));

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    return NextResponse.json(kid);
  } catch (error) {
    console.error("Error fetching kid:", error);
    return NextResponse.json({ error: "Failed to fetch kid" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const kid = await updateKid(Number(id), {
      name,
      grade: grade || null,
      shoeSize: shoe_size || null,
      parentName: parent_name || null,
      parentEmail: parent_email || null,
      parentPhone: parent_phone || null,
      notes: notes || null,
    });

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    return NextResponse.json(kid);
  } catch (error) {
    console.error("Error updating kid:", error);
    return NextResponse.json({ error: "Failed to update kid" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kid = await softDeleteKid(Number(id));

    if (!kid) {
      return NextResponse.json({ error: "Kid not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting kid:", error);
    return NextResponse.json({ error: "Failed to delete kid" }, { status: 500 });
  }
}
