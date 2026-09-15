import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import { venuePresenceKeys } from "@/services/api/query-keys";

export type VenuePresenceFriend = { id: string; name: string; avatar: string | null };
export type VenuePresence = { venueId: string; count: number; friendsPresent: VenuePresenceFriend[] };

export async function getVenuePresence(venueId: string): Promise<VenuePresence> {
  return apiClient<VenuePresence>(`/venues/${encodeURIComponent(venueId)}/presence`);
}

export function useVenuePresenceQuery(venueId: string | undefined) {
  return useQuery({ queryKey: venuePresenceKeys.detail(venueId ?? ""), queryFn: () => getVenuePresence(venueId as string), enabled: Boolean(venueId), staleTime: 10_000 });
}

export function invalidateVenuePresence(client: ReturnType<typeof useQueryClient>, venueId?: string) {
  if (venueId) void client.invalidateQueries({ queryKey: venuePresenceKeys.detail(venueId) });
}
