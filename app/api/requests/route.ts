import { NextRequest, NextResponse } from "next/server";
import {
  getAllRequests,
  createRequest,
  updateRequestStatus,
} from "@/lib/queries/requests";
import { getKidByIdentity } from "@/lib/queries/kids";
import {
  requestSchema,
  requestStatusSchema,
} from "@/lib/validations/request";
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

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = requestStatusSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Choose a valid request status." },
        { status: 400 }
      );
    }

    const updated = await updateRequestStatus(
      parsed.data.id,
      parsed.data.status
    );

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
