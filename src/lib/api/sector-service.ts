import { apiClient } from "./client";

export type Sector = {
  id: number;
  sector: string;
  description: string;
  status: "Active" | "Inactive";
  companyCount: number;
  createdDate: string;
};

export const sectorService = {
  list: async () => (await apiClient.get<Sector[]>("/sectors")).data,
  get: async (id: number) => (await apiClient.get<Sector>(`/sectors/${id}`)).data,
  create: async (payload: Omit<Sector, "id" | "companyCount" | "createdDate">) =>
    (await apiClient.post<Sector>("/sectors", payload)).data,
  update: async (id: number, payload: Partial<Sector>) =>
    (await apiClient.put<Sector>(`/sectors/${id}`, payload)).data,
  remove: async (id: number) => (await apiClient.delete<{ id: number; deleted: true }>(`/sectors/${id}`)).data,
};
