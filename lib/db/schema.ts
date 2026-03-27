import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Kids ────────────────────────────────────────────────────────────────────

export const kids = pgTable(
  "kids",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    grade: varchar("grade", { length: 50 }),
    shoeSize: varchar("shoe_size", { length: 20 }),
    parentName: varchar("parent_name", { length: 255 }),
    parentEmail: varchar("parent_email", { length: 255 }),
    parentPhone: varchar("parent_phone", { length: 20 }),
    notes: text("notes"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("kids_name_idx").on(t.name)]
);

export const kidsRelations = relations(kids, ({ many }) => ({
  checkouts: many(checkouts),
  requests: many(equipmentRequests),
  waitlistEntries: many(equipmentWaitlist),
}));

// ─── Equipment ───────────────────────────────────────────────────────────────

export const equipment = pgTable(
  "equipment",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    size: varchar("size", { length: 20 }),
    brand: varchar("brand", { length: 100 }),
    condition: varchar("condition", { length: 50 }).default("good").notNull(),
    status: varchar("status", { length: 50 }).default("available").notNull(),
    notes: text("notes"),
    photoUrl: text("photo_url"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("equipment_type_status_idx").on(t.type, t.status),
    index("equipment_size_idx").on(t.size),
  ]
);

export const equipmentRelations = relations(equipment, ({ many }) => ({
  checkouts: many(checkouts),
}));

// ─── Checkouts ───────────────────────────────────────────────────────────────

export const checkouts = pgTable(
  "checkouts",
  {
    id: serial("id").primaryKey(),
    equipmentId: integer("equipment_id")
      .notNull()
      .references(() => equipment.id),
    kidId: integer("kid_id")
      .notNull()
      .references(() => kids.id),
    checkedOutAt: timestamp("checked_out_at").defaultNow().notNull(),
    returnedAt: timestamp("returned_at"),
    notes: text("notes"),
  },
  (t) => [
    index("checkouts_kid_returned_idx").on(t.kidId, t.returnedAt),
    index("checkouts_equipment_idx").on(t.equipmentId),
  ]
);

export const checkoutsRelations = relations(checkouts, ({ one }) => ({
  kid: one(kids, {
    fields: [checkouts.kidId],
    references: [kids.id],
  }),
  equipment: one(equipment, {
    fields: [checkouts.equipmentId],
    references: [equipment.id],
  }),
}));

// ─── Equipment Requests ──────────────────────────────────────────────────────

export const equipmentRequests = pgTable("equipment_requests", {
  id: serial("id").primaryKey(),
  kidId: integer("kid_id")
    .notNull()
    .references(() => kids.id, { onDelete: "cascade" }),
  equipmentType: varchar("equipment_type", { length: 50 }).notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
});

export const equipmentRequestsRelations = relations(equipmentRequests, ({ one }) => ({
  kid: one(kids, {
    fields: [equipmentRequests.kidId],
    references: [kids.id],
  }),
}));

// ─── Equipment Waitlist ──────────────────────────────────────────────────────

export const equipmentWaitlist = pgTable(
  "equipment_waitlist",
  {
    id: serial("id").primaryKey(),
    kidId: integer("kid_id")
      .notNull()
      .references(() => kids.id, { onDelete: "cascade" }),
    equipmentType: varchar("equipment_type", { length: 50 }).notNull(),
    size: varchar("size", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
  },
  (t) => [unique("waitlist_kid_type_size_uniq").on(t.kidId, t.equipmentType, t.size)]
);

export const equipmentWaitlistRelations = relations(equipmentWaitlist, ({ one }) => ({
  kid: one(kids, {
    fields: [equipmentWaitlist.kidId],
    references: [kids.id],
  }),
}));
