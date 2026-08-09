import { NextRequest, NextResponse } from "next/server";
import { getActiveWaitlist, addToWaitlist } from "@/lib/queries/waitlist";
import { getKidByIdentity } from "@/lib/queries/kids";
import { waitlistSchema } from "@/lib/validations/waitlist";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const waitlist = await getActiveWaitlist();
    return NextResponse.json(waitlist, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { kid_name, parent_email, equipment_type, size } = parsed.data;
    const kid = await getKidByIdentity(kid_name, parent_email);

    if (!kid) {
      return NextResponse.json(
        { error: "Registration details did not match. Check the child name and parent email." },
        { status: 404 }
      );
    }

    const result = await addToWaitlist({
      kidId: kid.id,
      equipmentType: equipment_type,
      size,
    });

    if ("alreadyExists" in result) {
      return NextResponse.json({ message: "Already on waitlist" });
    }

    return NextResponse.json(result.entry, { status: 201 });
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 });
  }
}
