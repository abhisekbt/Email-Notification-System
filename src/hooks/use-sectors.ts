"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Sector, sectorService } from "@/lib/api/sector-service";

const keys = {
  all: ["sectors"] as const,
  detail: (id: number) => ["sectors", id] as const,
};

export function useSectors() {
  return useQuery({
    queryKey: keys.all,
    queryFn: () => sectorService.list(),
  });
}

export function useSector(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => sectorService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Sector, "id" | "companyCount" | "createdDate">) =>
      sectorService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Sector> }) =>
      sectorService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useDeleteSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sectorService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
