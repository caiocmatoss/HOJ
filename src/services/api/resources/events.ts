import { useQuery } from "@tanstack/react-query";
import { apiClientWithMeta, apiClient } from "@/services/api/client";
import type { ApiEvent } from "@/services/api";
import { eventKeys } from "@/services/api/query-keys";
import type { PaginationParams } from "./venues";
import { parsePaginationHeaders, type PaginatedResult } from "@/services/api/pagination";
export type EventListParams = PaginationParams & { q?: string; category?: string; from?: string; to?: string };
export async function listEvents(params: EventListParams = {}): Promise<PaginatedResult<ApiEvent>> { const query = new URLSearchParams(); Object.entries({ limit: 100, ...params }).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); }); const response = await apiClientWithMeta<ApiEvent[]>(`/events?${query.toString()}`, { authenticated: false }); return parsePaginationHeaders(response.data, response.headers); }
export async function getEventById(id: string): Promise<ApiEvent> { return apiClient<ApiEvent>(`/events/${encodeURIComponent(id)}`, { authenticated: false }); }
export function useEventsQuery(params: EventListParams = {}) { return useQuery({ queryKey: eventKeys.list(params), queryFn: () => listEvents(params), staleTime: 30_000 }); }
export function useEventQuery(id: string | undefined) { return useQuery({ queryKey: eventKeys.detail(id ?? ""), queryFn: () => getEventById(id as string), enabled: Boolean(id), staleTime: 30_000 }); }
