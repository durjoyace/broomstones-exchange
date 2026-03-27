import { z } from "zod/v4";

export const kidSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  grade: z.string().max(50).optional().or(z.literal("")),
  shoe_size: z.string().max(20).optional().or(z.literal("")),
  parent_name: z.string().min(1, "Parent name is required").max(100),
  parent_email: z.string().email("Valid email required"),
  parent_phone: z.string().max(20).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type KidInput = z.infer<typeof kidSchema>;
