import { z } from "zod";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  email: z.string().email("Enter a valid email"),
  alternativeEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  mobile: z.string().min(7, "Enter a valid mobile number"),
  address: z.string().min(3, "Address is required"),
  pan: z.string().regex(panRegex, "Enter a valid PAN (e.g. ABCDE1234F)").or(z.string().min(3)),
  industry: z.string().min(1, "Select an industry"),
  status: z.enum(["Active", "Inactive"]),
  categories: z.array(z.string()).min(1, "Select at least one discipline"),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
