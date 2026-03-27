import { NextRequest, NextResponse } from "next/server";
import { getAllRequests, createRequest } from "@/lib/queries/requests";
import { requestSchema } from "@/lib/validations/request";

export async function GET() {
  try {
    const requests = await getAllRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { kid_id, equipment_type, size, notes } = parsed.data;

    const result = await createRequest({
      kidId: kid_id,
      equipmentType: equipment_type,
      size,
      notes: notes || undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
