import { NextRequest, NextResponse } from "next/server";
import { getActiveWaitlist, addToWaitlist } from "@/lib/queries/waitlist";
import { waitlistSchema } from "@/lib/validations/waitlist";

export async function GET() {
  try {
    const waitlist = await getActiveWaitlist();
    return NextResponse.json(waitlist);
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

    const { kid_id, equipment_type, size } = parsed.data;

    const result = await addToWaitlist({
      kidId: kid_id,
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
