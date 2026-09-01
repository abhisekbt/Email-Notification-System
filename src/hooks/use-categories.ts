"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Category, categoryService } from "@/lib/api/category-service";

const keys = {
  all: ["categories"] as const,
  detail: (id: number) => ["categories", id] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: keys.all,
    queryFn: () => categoryService.list(),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => categoryService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Category, "id" | "companyCount" | "createdDate">) =>
      categoryService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Category> }) =>
      categoryService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
