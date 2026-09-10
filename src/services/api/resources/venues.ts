import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiClientWithMeta } from "@/services/api/client";
import type { ApiVenue } from "@/services/api";
import { venueKeys } from "@/services/api/query-keys";
import { parsePaginationHeaders, type PaginatedResult } from "@/services/api/pagination";

export type PaginationParams = { page?: number; limit?: number };
export type VenueListParams = PaginationParams & { q?: string; category?: string; locality?: string; region?: string; country?: string; source?: "MANUAL" | "IMPORTED" };
export async function listVenues(params: VenueListParams = {}): Promise<PaginatedResult<ApiVenue>> {
  const query = new URLSearchParams();
  Object.entries({ limit: 100, ...params }).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  const response = await apiClientWithMeta<ApiVenue[]>(`/venues?${query.toString()}`, { authenticated: false });
  return parsePaginationHeaders(response.data, response.headers);
}
export async function getVenueById(id: string): Promise<ApiVenue> { return apiClient<ApiVenue>(`/venues/${encodeURIComponent(id)}`, { authenticated: false }); }
export function useVenuesQuery(params: VenueListParams = {}) { return useQuery({ queryKey: venueKeys.list(params), queryFn: () => listVenues(params), staleTime: 30_000 }); }
export function useVenueQuery(id: string | undefined) { return useQuery({ queryKey: venueKeys.detail(id ?? ""), queryFn: () => getVenueById(id as string), enabled: Boolean(id), staleTime: 30_000 }); }
export function invalidateVenueQueries(client: ReturnType<typeof useQueryClient>, id?: string) { if (id) void client.invalidateQueries({ queryKey: venueKeys.detail(id) }); void client.invalidateQueries({ queryKey: venueKeys.all }); }
