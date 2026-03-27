import { eq, isNull, sql, desc } from "drizzle-orm";
import { db } from "../db";
import { equipment, kids, checkouts } from "../db/schema";

export async function getDashboardStats() {
  // Run all queries in parallel
  const [
    equipmentStats,
    kidsCount,
    activeCheckoutsCount,
    kidsSizeDistribution,
    availableShoesBySize,
    availableBroomsBySize,
    recentActivity,
  ] = await Promise.all([
    // 1. Equipment aggregate stats
    db
      .select({
        total: sql<number>`COUNT(*)`,
        available: sql<number>`COUNT(*) FILTER (WHERE ${equipment.status} = 'available')`,
        checkedOut: sql<number>`COUNT(*) FILTER (WHERE ${equipment.status} = 'checked_out')`,
        retired: sql<number>`COUNT(*) FILTER (WHERE ${equipment.status} = 'retired')`,
        totalShoes: sql<number>`COUNT(*) FILTER (WHERE ${equipment.type} = 'shoes')`,
        totalBrooms: sql<number>`COUNT(*) FILTER (WHERE ${equipment.type} = 'broom')`,
      })
      .from(equipment)
      .where(isNull(equipment.deletedAt)),

    // 2. Kids count
    db
      .select({ total: sql<number>`COUNT(*)` })
      .from(kids)
      .where(isNull(kids.deletedAt)),

    // 3. Active checkouts count
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(checkouts)
      .where(isNull(checkouts.returnedAt)),

    // 4. Kids shoe size distribution
    db
      .select({
        shoeSize: kids.shoeSize,
        count: sql<number>`COUNT(*)`,
      })
      .from(kids)
      .where(
        sql`${kids.shoeSize} IS NOT NULL AND ${kids.shoeSize} != '' AND ${kids.deletedAt} IS NULL`
      )
      .groupBy(kids.shoeSize)
      .orderBy(kids.shoeSize),

    // 5. Available shoes by size
    db
      .select({
        size: equipment.size,
        count: sql<number>`COUNT(*)`,
      })
      .from(equipment)
      .where(
        sql`${equipment.type} = 'shoes' AND ${equipment.status} = 'available' AND ${equipment.size} IS NOT NULL AND ${equipment.deletedAt} IS NULL`
      )
      .groupBy(equipment.size)
      .orderBy(equipment.size),

    // 6. Available brooms by size
    db
      .select({
        size: equipment.size,
        count: sql<number>`COUNT(*)`,
      })
      .from(equipment)
      .where(
        sql`${equipment.type} = 'broom' AND ${equipment.status} = 'available' AND ${equipment.deletedAt} IS NULL`
      )
      .groupBy(equipment.size)
      .orderBy(equipment.size),

    // 7. Recent activity (10 latest checkouts/returns)
    db
      .select({
        id: checkouts.id,
        kidId: checkouts.kidId,
        equipmentId: checkouts.equipmentId,
        checkedOutAt: checkouts.checkedOutAt,
        returnedAt: checkouts.returnedAt,
        notes: checkouts.notes,
        kidName: kids.name,
        equipmentType: equipment.type,
        equipmentSize: equipment.size,
      })
      .from(checkouts)
      .innerJoin(kids, eq(checkouts.kidId, kids.id))
      .innerJoin(equipment, eq(checkouts.equipmentId, equipment.id))
      .orderBy(desc(sql`COALESCE(${checkouts.returnedAt}, ${checkouts.checkedOutAt})`))
      .limit(10),
  ]);

  return {
    equipment: equipmentStats[0],
    kids: kidsCount[0],
    checkouts: { activeCheckouts: activeCheckoutsCount[0].count },
    kidsSizeDistribution,
    availableShoesBySize,
    availableBroomsBySize,
    recentActivity,
  };
}
