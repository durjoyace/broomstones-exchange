import { eq, ilike, isNull, sql } from "drizzle-orm";
import { db, type Kid, type NewKid } from "../db";
import { kids, checkouts, equipment } from "../db/schema";

export async function getAllKids() {
  const rows = await db
    .select({
      id: kids.id,
      name: kids.name,
      grade: kids.grade,
      shoeSize: kids.shoeSize,
      parentName: kids.parentName,
      parentEmail: kids.parentEmail,
      parentPhone: kids.parentPhone,
      notes: kids.notes,
      deletedAt: kids.deletedAt,
      createdAt: kids.createdAt,
      updatedAt: kids.updatedAt,
      activeCheckouts: sql<number>`(
        SELECT COUNT(*) FROM checkouts c
        WHERE c.kid_id = ${kids.id} AND c.returned_at IS NULL
      )`.as("active_checkouts"),
    })
    .from(kids)
    .where(isNull(kids.deletedAt))
    .orderBy(kids.name);
  return rows;
}

export async function getKidById(id: number) {
  const [kid] = await db
    .select()
    .from(kids)
    .where(eq(kids.id, id));
  return kid ?? null;
}

export async function createKid(data: NewKid) {
  const [kid] = await db.insert(kids).values(data).returning();
  return kid;
}

export async function updateKid(id: number, data: Partial<NewKid>) {
  const [kid] = await db
    .update(kids)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(kids.id, id))
    .returning();
  return kid ?? null;
}

export async function softDeleteKid(id: number) {
  const [kid] = await db
    .update(kids)
    .set({ deletedAt: new Date() })
    .where(eq(kids.id, id))
    .returning();
  return kid ?? null;
}

export async function searchKids(query: string) {
  const foundKids = await db
    .select({
      id: kids.id,
      name: kids.name,
      shoeSize: kids.shoeSize,
    })
    .from(kids)
    .where(ilike(kids.name, `%${query}%`))
    .orderBy(kids.name)
    .limit(10);

  // Single query with JOIN instead of N+1
  if (foundKids.length === 0) return [];

  const kidIds = foundKids.map((k) => k.id);
  const activeCheckouts = await db
    .select({
      id: checkouts.id,
      kidId: checkouts.kidId,
      checkedOutAt: checkouts.checkedOutAt,
      equipmentType: equipment.type,
      equipmentSize: equipment.size,
      equipmentBrand: equipment.brand,
    })
    .from(checkouts)
    .innerJoin(equipment, eq(checkouts.equipmentId, equipment.id))
    .where(
      sql`${checkouts.kidId} IN (${sql.join(
        kidIds.map((id) => sql`${id}`),
        sql`, `
      )}) AND ${checkouts.returnedAt} IS NULL`
    )
    .orderBy(checkouts.checkedOutAt);

  return foundKids.map((kid) => ({
    ...kid,
    checkouts: activeCheckouts.filter((c) => c.kidId === kid.id),
  }));
}
