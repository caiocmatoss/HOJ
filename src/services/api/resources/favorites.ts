import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import type { ApiFavorite } from "@/services/api";
import { favoriteKeys, venueKeys } from "@/services/api/query-keys";
export async function listFavorites(): Promise<ApiFavorite[]> { return apiClient<ApiFavorite[]>("/favorites"); }
export async function addFavoriteResource(venueId: string): Promise<ApiFavorite> { return apiClient<ApiFavorite>(`/favorites/${encodeURIComponent(venueId)}`, { method: "POST" }); }
export async function removeFavoriteResource(venueId: string): Promise<void> { await apiClient<unknown>(`/favorites/${encodeURIComponent(venueId)}`, { method: "DELETE" }); }
export function useFavoritesQuery() { return useQuery({ queryKey: favoriteKeys.all, queryFn: listFavorites, staleTime: 15_000 }); }
export function useFavoriteMutation() { const client = useQueryClient(); return useMutation({ mutationFn: ({ venueId, active }: { venueId: string; active: boolean }) => active ? removeFavoriteResource(venueId) : addFavoriteResource(venueId).then(() => undefined), onSuccess: () => { void client.invalidateQueries({ queryKey: favoriteKeys.all }); void client.invalidateQueries({ queryKey: venueKeys.all }); } }); }
