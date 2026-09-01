import { z } from "zod";

export const categorySchema = z.object({
  category: z.string().min(2, "Category name is required"),
  description: z.string().min(5, "Provide a short description"),
  status: z.enum(["Active", "Inactive"]),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
