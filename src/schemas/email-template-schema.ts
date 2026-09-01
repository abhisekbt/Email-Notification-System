import { z } from "zod";

export const emailTemplateSchema = z.object({
  templateName: z.string().min(2, "Template name is required"),
  subject: z.string().min(3, "Subject is required"),
  body: z.string().min(10, "Provide a longer email body"),
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;
