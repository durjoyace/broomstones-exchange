import { z } from "zod/v4";

export const lookupSchema = z.object({
  child_name: z.string().trim().min(2, "Child name is required").max(100),
  parent_email: z.string().trim().email("Valid parent email required").max(254),
});

export type LookupInput = z.infer<typeof lookupSchema>;
