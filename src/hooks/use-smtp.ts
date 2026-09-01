"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SmtpConfig, smtpService } from "@/lib/api/smtp-service";

const keys = {
  config: ["smtp", "config"] as const,
};

export function useSmtpConfig() {
  return useQuery({
    queryKey: keys.config,
    queryFn: () => smtpService.get(),
  });
}

export function useUpdateSmtpConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SmtpConfig>) => smtpService.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.config }),
  });
}

export function useTestSmtpConnection() {
  return useMutation({
    mutationFn: () => smtpService.test(),
  });
}
