import { z } from "zod";

export const smtpSettingsSchema = z.object({
  host: z.string().min(1, "SMTP host is required"),
  port: z.coerce.number().int("Port must be a whole number").min(1, "Enter a valid port").max(65535, "Enter a valid port"),
  username: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  encryption: z.enum(["tls", "ssl", "none"]),
  senderEmail: z.string().email("Enter a valid sender email"),
  senderName: z.string().min(1, "Sender name is required"),
});

export type SmtpSettingsInput = z.input<typeof smtpSettingsSchema>;
export type SmtpSettingsFormValues = z.output<typeof smtpSettingsSchema>;
