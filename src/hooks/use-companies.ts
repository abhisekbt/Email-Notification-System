"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { companyService, Company } from "@/lib/api/company-service";

const keys = {
  all: ["companies"] as const,
  detail: (id: number) => ["companies", id] as const,
};

export function useCompanies() {
  return useQuery({
    queryKey: keys.all,
    queryFn: () => companyService.list(),
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => companyService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Company, "id" | "createdDate">) => companyService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Company> }) =>
      companyService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companyService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useAssignCompanyCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, categories }: { id: number; categories: string[] }) =>
      companyService.assignCategories(id, categories),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
    },
  });
}
