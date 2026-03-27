import { eq, desc } from "drizzle-orm";
import { db, type NewEquipmentRequest } from "../db";
import { equipmentRequests, kids } from "../db/schema";

export async function getAllRequests() {
  return db
    .select({
      id: equipmentRequests.id,
      kidId: equipmentRequests.kidId,
      equipmentType: equipmentRequests.equipmentType,
      size: equipmentRequests.size,
      notes: equipmentRequests.notes,
      status: equipmentRequests.status,
      createdAt: equipmentRequests.createdAt,
      fulfilledAt: equipmentRequests.fulfilledAt,
      kidName: kids.name,
      kidShoeSize: kids.shoeSize,
    })
    .from(equipmentRequests)
    .innerJoin(kids, eq(equipmentRequests.kidId, kids.id))
    .orderBy(desc(equipmentRequests.createdAt));
}

export async function createRequest(data: {
  kidId: number;
  equipmentType: string;
  size: string;
  notes?: string;
}) {
  const [request] = await db
    .insert(equipmentRequests)
    .values({
      kidId: data.kidId,
      equipmentType: data.equipmentType,
      size: data.size,
      notes: data.notes ?? null,
    })
    .returning();
  return request;
}
