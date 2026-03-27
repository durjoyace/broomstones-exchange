import { z } from "zod/v4";

export const waitlistSchema = z.object({
  kid_id: z.number().int().positive("Kid ID required"),
  equipment_type: z.enum(["shoes", "broom"]),
  size: z.string().min(1, "Size is required").max(20),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
