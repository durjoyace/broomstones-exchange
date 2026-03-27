import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Re-export schema for direct use
export { schema };

// Inferred types from schema
export type Kid = typeof schema.kids.$inferSelect;
export type NewKid = typeof schema.kids.$inferInsert;
export type Equipment = typeof schema.equipment.$inferSelect;
export type NewEquipment = typeof schema.equipment.$inferInsert;
export type Checkout = typeof schema.checkouts.$inferSelect;
export type NewCheckout = typeof schema.checkouts.$inferInsert;
export type EquipmentRequest = typeof schema.equipmentRequests.$inferSelect;
export type NewEquipmentRequest = typeof schema.equipmentRequests.$inferInsert;
export type WaitlistEntry = typeof schema.equipmentWaitlist.$inferSelect;
export type NewWaitlistEntry = typeof schema.equipmentWaitlist.$inferInsert;
