import { z } from "zod";

export const emailSendSchema = z.object({
  subject: z.string().min(3, "Subject is required"),
  templateId: z.string().optional(),
  body: z.string().min(10, "Message body should be at least 10 characters"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
});

export type EmailSendFormValues = z.infer<typeof emailSendSchema>;
