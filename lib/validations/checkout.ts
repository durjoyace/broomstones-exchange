import { z } from "zod/v4";

export const checkoutSchema = z.object({
  equipment_id: z.number().int().positive("Equipment ID required"),
  kid_id: z.number().int().positive("Kid ID required"),
  notes: z.string().optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
