import { apiClient } from "./client";

export type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "tls" | "ssl" | "none";
  senderEmail: string;
  senderName: string;
};

export const smtpService = {
  get: async () => (await apiClient.get<SmtpConfig>("/smtp-config")).data,
  update: async (payload: Partial<SmtpConfig>) => (await apiClient.put<SmtpConfig>("/smtp-config", payload)).data,
  test: async () => (await apiClient.post<{ success: boolean; message: string }>("/smtp-config/test")).data,
};
