"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  communicationService,
  ScheduleCommunicationPayload,
  SendCommunicationPayload,
  TestDispatchPayload,
} from "@/lib/api/communication-service";

const keys = {
  all: ["communications"] as const,
  detail: (id: number) => ["communications", id] as const,
};

export function useCommunications() {
  return useQuery({
    queryKey: keys.all,
    queryFn: () => communicationService.list(),
  });
}

export function useCommunication(id: number) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => communicationService.get(id),
    enabled: Boolean(id),
  });
}

export function useSendCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendCommunicationPayload) => communicationService.send(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useScheduleCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScheduleCommunicationPayload) => communicationService.schedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDraftCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendCommunicationPayload) => communicationService.draft(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useTestDispatchCommunication() {
  return useMutation({
    mutationFn: (payload: TestDispatchPayload) => communicationService.testDispatch(payload),
  });
}
