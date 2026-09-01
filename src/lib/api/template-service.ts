import { apiClient } from "./client";

export type EmailTemplate = {
  id: number;
  templateName: string;
  subject: string;
  body: string;
  createdDate: string;
};

export const templateService = {
  list: async () => (await apiClient.get<EmailTemplate[]>("/email-templates")).data,
  get: async (id: number) => (await apiClient.get<EmailTemplate>(`/email-templates/${id}`)).data,
  create: async (payload: Omit<EmailTemplate, "id" | "createdDate">) =>
    (await apiClient.post<EmailTemplate>("/email-templates", payload)).data,
  update: async (id: number, payload: Partial<EmailTemplate>) =>
    (await apiClient.put<EmailTemplate>(`/email-templates/${id}`, payload)).data,
  remove: async (id: number) =>
    (await apiClient.delete<{ id: number; deleted: true }>(`/email-templates/${id}`)).data,
};
