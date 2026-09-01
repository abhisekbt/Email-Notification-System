"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmailTemplate, templateService } from "@/lib/api/template-service";

const keys = {
  all: ["email-templates"] as const,
  detail: (id: number) => ["email-templates", id] as const,
};

export function useEmailTemplates() {
  return useQuery({
    queryKey: keys.all,
    queryFn: () => templateService.list(),
  });
}

export function useEmailTemplate(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => templateService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<EmailTemplate, "id" | "createdDate">) =>
      templateService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EmailTemplate> }) =>
      templateService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keys.all });
      queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => templateService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}
