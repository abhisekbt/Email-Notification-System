import { apiClient } from "./client";
import { Communication, DetailedCommunication, EmailAttachment } from "@/types";

export type { Communication, DetailedCommunication };

export interface SendCommunicationPayload {
  subject: string;
  body: string;
  categories: string[];
  attachments?: EmailAttachment[];
}

export interface ScheduleCommunicationPayload extends SendCommunicationPayload {
  scheduledFor: string;
}

export interface TestDispatchPayload {
  subject: string;
  body: string;
  testEmail: string;
  attachments?: EmailAttachment[];
}

export const communicationService = {
  list: async () => (await apiClient.get<Communication[]>("/communications")).data,
  get: async (id: number) => (await apiClient.get<DetailedCommunication>(`/communications/${id}`)).data,
  send: async (payload: SendCommunicationPayload) =>
    (await apiClient.post<Communication>("/communications/send", payload)).data,
  schedule: async (payload: ScheduleCommunicationPayload) =>
    (await apiClient.post<Communication>("/communications/schedule", payload)).data,
  draft: async (payload: SendCommunicationPayload) =>
    (await apiClient.post<Communication>("/communications/draft", payload)).data,
  testDispatch: async (payload: TestDispatchPayload) =>
    (await apiClient.post<{ success: boolean; message: string }>("/communications/test-dispatch", payload)).data,
};
