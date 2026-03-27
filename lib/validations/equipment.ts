import { z } from "zod/v4";

export const equipmentSchema = z.object({
  type: z.enum(["shoes", "broom"]),
  size: z.string().max(20).optional().or(z.literal("")),
  brand: z.string().max(100).optional().or(z.literal("")),
  condition: z.enum(["excellent", "good", "fair", "poor"]).default("good"),
  notes: z.string().optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
});

export const equipmentUpdateSchema = equipmentSchema.extend({
  status: z.enum(["available", "checked_out", "retired"]).default("available"),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;
export type EquipmentUpdateInput = z.infer<typeof equipmentUpdateSchema>;
