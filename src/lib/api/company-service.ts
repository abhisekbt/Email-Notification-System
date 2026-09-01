import { apiClient } from "./client";

export type Company = {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  alternativeEmail?: string | null;
  mobile: string;
  address: string;
  pan: string;
  industry: string;
  status: "Active" | "Inactive";
  categories: string[];
  createdDate: string;
};

export const companyService = {
  list: async () => (await apiClient.get<Company[]>("/companies")).data,
  get: async (id: number) => (await apiClient.get<Company>(`/companies/${id}`)).data,
  create: async (payload: Omit<Company, "id" | "createdDate">) =>
    (await apiClient.post<Company>("/companies", payload)).data,
  update: async (id: number, payload: Partial<Company>) =>
    (await apiClient.put<Company>(`/companies/${id}`, payload)).data,
  remove: async (id: number) => (await apiClient.delete<{ id: number; deleted: true }>(`/companies/${id}`)).data,
  assignCategories: async (id: number, categories: string[]) =>
    (await apiClient.post<Company>(`/companies/${id}/categories`, { categories })).data,
};
