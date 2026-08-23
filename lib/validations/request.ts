import { z } from "zod/v4";

export const requestSchema = z.object({
  kid_name: z.string().trim().min(2, "Child name is required").max(100),
  parent_email: z.string().trim().email("Valid parent email required").max(254),
  equipment_type: z.enum(["shoes", "broom"]),
  size: z.string().trim().min(1, "Size is required").max(20),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const requestStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["pending", "fulfilled", "cancelled"]),
});

export type RequestInput = z.infer<typeof requestSchema>;
export type RequestStatusInput = z.infer<typeof requestStatusSchema>;
