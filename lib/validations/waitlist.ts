import { z } from "zod/v4";

export const waitlistSchema = z.object({
  kid_name: z.string().trim().min(2, "Child name is required").max(100),
  parent_email: z.string().trim().email("Valid parent email required").max(254),
  equipment_type: z.enum(["shoes", "broom"]),
  size: z.string().trim().min(1, "Size is required").max(20),
});

export const waitlistStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  notified: z.boolean(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistStatusInput = z.infer<typeof waitlistStatusSchema>;
