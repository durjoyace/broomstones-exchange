import { eq, isNull, sql, and } from "drizzle-orm";
import { db } from "../db";
import { equipmentWaitlist, kids } from "../db/schema";

export async function getActiveWaitlist() {
  return db
    .select({
      id: equipmentWaitlist.id,
      kidId: equipmentWaitlist.kidId,
      equipmentType: equipmentWaitlist.equipmentType,
      size: equipmentWaitlist.size,
      createdAt: equipmentWaitlist.createdAt,
      notifiedAt: equipmentWaitlist.notifiedAt,
      kidName: kids.name,
      parentEmail: kids.parentEmail,
    })
    .from(equipmentWaitlist)
    .innerJoin(kids, eq(equipmentWaitlist.kidId, kids.id))
    .where(isNull(equipmentWaitlist.notifiedAt))
    .orderBy(equipmentWaitlist.createdAt);
}

export async function addToWaitlist(data: {
  kidId: number;
  equipmentType: string;
  size: string;
}) {
  // Check if already on waitlist
  const [existing] = await db
    .select({ id: equipmentWaitlist.id })
    .from(equipmentWaitlist)
    .where(
      and(
        eq(equipmentWaitlist.kidId, data.kidId),
        eq(equipmentWaitlist.equipmentType, data.equipmentType),
        eq(equipmentWaitlist.size, data.size),
        isNull(equipmentWaitlist.notifiedAt)
      )
    );

  if (existing) {
    return { alreadyExists: true };
  }

  const [entry] = await db
    .insert(equipmentWaitlist)
    .values({
      kidId: data.kidId,
      equipmentType: data.equipmentType,
      size: data.size,
    })
    .returning();

  return { entry };
}
