import { z } from "zod";

export const sectorSchema = z.object({
  sector: z.string().min(2, "Sector name is required"),
  description: z.string().min(5, "Provide a short description"),
  status: z.enum(["Active", "Inactive"]),
});

export type SectorFormValues = z.infer<typeof sectorSchema>;
