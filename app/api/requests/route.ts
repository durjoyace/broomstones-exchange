import { NextRequest, NextResponse } from "next/server";
import { getAllRequests, createRequest } from "@/lib/queries/requests";
import { getKidByIdentity } from "@/lib/queries/kids";
import { requestSchema } from "@/lib/validations/request";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await getAllRequests();
    return NextResponse.json(requests, {
      headers: { "Cache-Control": "private, no-store" },
    });
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

    const { kid_name, parent_email, equipment_type, size, notes } = parsed.data;
    const kid = await getKidByIdentity(kid_name, parent_email);

    if (!kid) {
      return NextResponse.json(
        { error: "Registration details did not match. Check the child name and parent email." },
        { status: 404 }
      );
    }

    const result = await createRequest({
      kidId: kid.id,
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
