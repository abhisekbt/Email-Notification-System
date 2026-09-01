import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().min(3, "Title is required"),
  recipient: z.string().email("A valid email is required"),
  message: z.string().min(10, "Message should be at least 10 characters"),
  channel: z.enum(["email", "sms", "portal"]),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
