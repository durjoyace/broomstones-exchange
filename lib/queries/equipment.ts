import { eq, isNull } from "drizzle-orm";
import { db, type NewEquipment } from "../db";
import { equipment } from "../db/schema";

export async function getAllEquipment() {
  return db
    .select()
    .from(equipment)
    .where(isNull(equipment.deletedAt))
    .orderBy(equipment.createdAt);
}

export async function getEquipmentById(id: number) {
  const [item] = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, id));
  return item ?? null;
}

export async function createEquipment(data: NewEquipment) {
  const [item] = await db
    .insert(equipment)
    .values({ ...data, status: "available" })
    .returning();
  return item;
}

export async function updateEquipment(id: number, data: Partial<NewEquipment>) {
  const [item] = await db
    .update(equipment)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(equipment.id, id))
    .returning();
  return item ?? null;
}

export async function softDeleteEquipment(id: number) {
  const [item] = await db
    .update(equipment)
    .set({ deletedAt: new Date(), status: "retired" })
    .where(eq(equipment.id, id))
    .returning();
  return item ?? null;
}
