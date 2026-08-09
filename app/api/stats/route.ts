import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/queries/stats";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const [stats, authenticated] = await Promise.all([
      getDashboardStats(),
      isAuthenticated(),
    ]);

    return NextResponse.json(
      {
        ...stats,
        recentActivity: authenticated ? stats.recentActivity : [],
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
          Vary: "Cookie",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
