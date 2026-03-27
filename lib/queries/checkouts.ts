import { eq, isNull, sql, desc } from "drizzle-orm";
import { db } from "../db";
import { checkouts, kids, equipment } from "../db/schema";

type CheckoutWithDetails = {
  id: number;
  equipmentId: number;
  kidId: number;
  checkedOutAt: Date;
  returnedAt: Date | null;
  notes: string | null;
  kidName: string;
  equipmentType: string;
  equipmentSize: string | null;
  equipmentBrand: string | null;
};

export async function getCheckouts(activeOnly: boolean): Promise<CheckoutWithDetails[]> {
  const baseQuery = db
    .select({
      id: checkouts.id,
      equipmentId: checkouts.equipmentId,
      kidId: checkouts.kidId,
      checkedOutAt: checkouts.checkedOutAt,
      returnedAt: checkouts.returnedAt,
      notes: checkouts.notes,
      kidName: kids.name,
      equipmentType: equipment.type,
      equipmentSize: equipment.size,
      equipmentBrand: equipment.brand,
    })
    .from(checkouts)
    .innerJoin(kids, eq(checkouts.kidId, kids.id))
    .innerJoin(equipment, eq(checkouts.equipmentId, equipment.id))
    .orderBy(desc(checkouts.checkedOutAt));

  if (activeOnly) {
    return baseQuery.where(isNull(checkouts.returnedAt));
  }
  return baseQuery;
}

export async function createCheckout(data: {
  equipmentId: number;
  kidId: number;
  notes?: string;
}) {
  // Use a transaction: check availability + insert checkout + update equipment atomically
  // Since Neon HTTP driver doesn't support transactions natively,
  // we do optimistic locking: update equipment status first (only if available),
  // then insert checkout. If equipment wasn't available, the update affects 0 rows.
  const [updated] = await db
    .update(equipment)
    .set({ status: "checked_out", updatedAt: new Date() })
    .where(
      sql`${equipment.id} = ${data.equipmentId} AND ${equipment.status} = 'available'`
    )
    .returning();

  if (!updated) {
    return { error: "Equipment is not available for checkout" };
  }

  const [checkout] = await db
    .insert(checkouts)
    .values({
      equipmentId: data.equipmentId,
      kidId: data.kidId,
      notes: data.notes ?? null,
    })
    .returning();

  return { checkout };
}

export async function returnCheckout(checkoutId: number) {
  // Find the active checkout
  const [active] = await db
    .select()
    .from(checkouts)
    .where(
      sql`${checkouts.id} = ${checkoutId} AND ${checkouts.returnedAt} IS NULL`
    );

  if (!active) {
    return { error: "Checkout not found or already returned" };
  }

  // Mark checkout as returned
  const [returned] = await db
    .update(checkouts)
    .set({ returnedAt: new Date() })
    .where(eq(checkouts.id, checkoutId))
    .returning();

  // Mark equipment as available
  await db
    .update(equipment)
    .set({ status: "available", updatedAt: new Date() })
    .where(eq(equipment.id, active.equipmentId));

  return { checkout: returned };
}

export async function bulkReturn(checkoutIds: number[]) {
  const results = await Promise.all(
    checkoutIds.map((id) => returnCheckout(id))
  );
  const errors = results.filter((r) => "error" in r);
  const successes = results.filter((r) => "checkout" in r);
  return { returned: successes.length, errors: errors.length };
}
