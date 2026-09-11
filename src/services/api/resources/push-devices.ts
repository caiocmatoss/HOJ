import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import { pushDeviceKeys } from "@/services/api/query-keys";

export type PushPlatform = "IOS" | "ANDROID";
export type PushDevice = { id: string; platform: PushPlatform; enabled: boolean; createdAt: string; updatedAt: string; lastUsedAt: string | null };
export type RegisterPushDeviceInput = { token: string; platform: PushPlatform };

export const listPushDevices = () => apiClient<PushDevice[]>("/notifications/devices");
export const registerPushDevice = (body: RegisterPushDeviceInput) => apiClient<PushDevice>("/notifications/devices", { method: "POST", body });
export const disablePushDevice = (id: string) => apiClient<null>(`/notifications/devices/${encodeURIComponent(id)}`, { method: "DELETE" });

export function usePushDevicesQuery(enabled = true) { return useQuery({ queryKey: pushDeviceKeys.list, queryFn: listPushDevices, enabled }); }
export function useRegisterPushDeviceMutation() { const client = useQueryClient(); return useMutation({ mutationFn: registerPushDevice, onSuccess: () => { void client.invalidateQueries({ queryKey: pushDeviceKeys.all }); } }); }
export function useDisablePushDeviceMutation() { const client = useQueryClient(); return useMutation({ mutationFn: disablePushDevice, onSuccess: () => { void client.invalidateQueries({ queryKey: pushDeviceKeys.all }); } }); }
