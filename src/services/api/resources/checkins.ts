import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import type { ApiCheckin, ApiCheckinMutationResponse } from "@/services/api";
import { checkinKeys, venueKeys, venuePresenceKeys } from "@/services/api/query-keys";
export async function getActiveCheckin(): Promise<ApiCheckin | null> { return apiClient<ApiCheckin | null>("/checkins/me"); }
export async function getCheckinHistoryResource(): Promise<ApiCheckin[]> { return apiClient<ApiCheckin[]>("/checkins/history"); }
export async function checkInResource(venueId: string): Promise<ApiCheckinMutationResponse> { return apiClient<ApiCheckinMutationResponse>(`/checkins/${encodeURIComponent(venueId)}`, { method: "POST" }); }
export async function checkOutResource(venueId: string): Promise<ApiCheckinMutationResponse> { return apiClient<ApiCheckinMutationResponse>(`/checkins/${encodeURIComponent(venueId)}/checkout`, { method: "PATCH" }); }
export function useActiveCheckinQuery() { return useQuery({ queryKey: checkinKeys.active, queryFn: getActiveCheckin, staleTime: 10_000 }); }
export function useCheckinHistoryQuery() { return useQuery({ queryKey: checkinKeys.history(), queryFn: getCheckinHistoryResource, staleTime: 30_000 }); }
export function useCheckinMutation() { const client = useQueryClient(); return useMutation({ mutationFn: checkInResource, onSuccess: (result, venueId) => { client.setQueryData(checkinKeys.active, result.checkin); void client.invalidateQueries({ queryKey: venueKeys.all }); void client.invalidateQueries({ queryKey: venuePresenceKeys.detail(venueId) }); } }); }
export function useCheckoutMutation() { const client = useQueryClient(); return useMutation({ mutationFn: checkOutResource, onSuccess: (_result, venueId) => { client.setQueryData(checkinKeys.active, null); void client.invalidateQueries({ queryKey: ["checkins", "history"] }); void client.invalidateQueries({ queryKey: venueKeys.all }); void client.invalidateQueries({ queryKey: venuePresenceKeys.detail(venueId) }); } }); }
