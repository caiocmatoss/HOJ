import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import { discoveryKeys } from "@/services/api/query-keys";

export type NearbyPlace = {
  id: string;
  externalId: string;
  source: "LOCAL" | "FOURSQUARE";
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string | null;
  locality: string | null;
  region: string | null;
  venueId: string | null;
};

export async function listNearbyPlaces(latitude: number, longitude: number, radius = 5000) {
  const params = new URLSearchParams({ lat: String(latitude), lng: String(longitude), radius: String(Math.min(radius, 5000)) });
  return apiClient<NearbyPlace[]>(`/discovery/nearby?${params.toString()}`, { authenticated: false });
}

export function useNearbyPlacesQuery(latitude: number | null, longitude: number | null) {
  const enabled = latitude != null && longitude != null;
  return useQuery({ queryKey: enabled ? discoveryKeys.nearby(Number(latitude.toFixed(3)), Number(longitude.toFixed(3)), 5000) : discoveryKeys.all, queryFn: () => listNearbyPlaces(latitude as number, longitude as number), enabled, staleTime: 30_000, retry: 1 });
}
