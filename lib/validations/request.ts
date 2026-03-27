import { z } from "zod/v4";

export const requestSchema = z.object({
  kid_id: z.number().int().positive("Kid ID required"),
  equipment_type: z.enum(["shoes", "broom"]),
  size: z.string().min(1, "Size is required").max(20),
  notes: z.string().optional().or(z.literal("")),
});

export type RequestInput = z.infer<typeof requestSchema>;
