import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiClientWithMeta } from "@/services/api/client";
import { parsePaginationHeaders, type PaginatedResult } from "@/services/api/pagination";
import { notificationKeys } from "@/services/api/query-keys";

export type ApiNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId: string | null;
  referenceType: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationParams = { page?: number; limit?: number };
const query = (params: NotificationParams = {}) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  return `page=${page}&limit=${limit}`;
};

export async function listNotifications(params: NotificationParams = {}): Promise<PaginatedResult<ApiNotification>> {
  const response = await apiClientWithMeta<ApiNotification[]>(`/notifications?${query(params)}`);
  return parsePaginationHeaders(response.data, response.headers);
}

export async function listUnreadNotifications(params: NotificationParams = {}): Promise<PaginatedResult<ApiNotification>> {
  const response = await apiClientWithMeta<ApiNotification[]>(`/notifications/unread?${query(params)}`);
  return parsePaginationHeaders(response.data, response.headers);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient<{ count: number }>("/notifications/unread/count");
  return Number.isFinite(response.count) ? response.count : 0;
}

export const markNotificationRead = (id: string) => apiClient<ApiNotification>(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
export const markAllNotificationsRead = () => apiClient<{ updated: number }>("/notifications/read-all", { method: "PATCH" });

export function useNotificationsQuery(params: NotificationParams = {}) {
  return useQuery({ queryKey: notificationKeys.list(params), queryFn: () => listNotifications(params) });
}
export function useUnreadNotificationsQuery(params: NotificationParams = {}) {
  return useQuery({ queryKey: notificationKeys.unread(params), queryFn: () => listUnreadNotifications(params) });
}
export function useUnreadNotificationCountQuery() {
  return useQuery({ queryKey: notificationKeys.unreadCount, queryFn: getUnreadNotificationCount, staleTime: 15_000 });
}
export function useMarkNotificationReadMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: markNotificationRead, onSuccess: () => { void client.invalidateQueries({ queryKey: notificationKeys.all }); } });
}
export function useMarkAllNotificationsReadMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: markAllNotificationsRead, onSuccess: () => { void client.invalidateQueries({ queryKey: notificationKeys.all }); } });
}
