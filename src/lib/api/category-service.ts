import { apiClient } from "./client";

export type Category = {
  id: number;
  category: string;
  description: string;
  status: "Active" | "Inactive";
  companyCount: number;
  createdDate: string;
};

export const categoryService = {
  list: async () => (await apiClient.get<Category[]>("/categories")).data,
  get: async (id: number) => (await apiClient.get<Category>(`/categories/${id}`)).data,
  create: async (payload: Omit<Category, "id" | "companyCount" | "createdDate">) =>
    (await apiClient.post<Category>("/categories", payload)).data,
  update: async (id: number, payload: Partial<Category>) =>
    (await apiClient.put<Category>(`/categories/${id}`, payload)).data,
  remove: async (id: number) => (await apiClient.delete<{ id: number; deleted: true }>(`/categories/${id}`)).data,
};
