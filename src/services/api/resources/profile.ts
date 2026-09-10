import { Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import type { AuthUser } from "@/services/api/types";
import { useUserStore } from "@/store/user-store";

export type SelfUser = AuthUser;
export type PublicUser = Omit<SelfUser, "email" | "phone" | "emailVerifiedAt">;

export type NotificationPreferences = {
  friendsNearby: boolean;
  newEvents: boolean;
  messages: boolean;
  eventReminders: boolean;
  friendCheckins: boolean;
  promotions: boolean;
  appUpdates: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
  friendRequests: boolean;
  groupInvites: boolean;
};

export type PrivacyPreferences = { showStatus: boolean; showLastSeen: boolean; showCheckinHistory: boolean };
export type LocationAccuracy = "HIGH" | "BALANCED";
export type LocationUpdateFrequency = "REALTIME" | "FIVE_MINUTES" | "FIFTEEN_MINUTES";
export type LocationPreferences = {
  precise: boolean;
  accuracy: LocationAccuracy;
  updateFreq: LocationUpdateFrequency;
  shareWithFriends: boolean;
};

export const profileQueryKeys = {
  me: ["users", "me"] as const,
  notificationPreferences: ["notifications", "preferences"] as const,
  privacyPreferences: ["privacy", "preferences"] as const,
  locationPreferences: ["locations", "preferences"] as const,
};

export type UpdateProfileInput = {
  name?: string;
  username?: string | null;
  city?: string | null;
  phone?: string | null;
  bio?: string | null;
};

export type AvatarAsset = { uri: string; fileName?: string | null; mimeType?: string | null };

export async function getMe(): Promise<SelfUser> {
  return apiClient<SelfUser>("/users/me");
}

export async function updateProfile(body: UpdateProfileInput): Promise<SelfUser> {
  return apiClient<SelfUser>("/users/me", { method: "PATCH", body });
}

async function toFormData(asset: AvatarAsset): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await fetch(asset.uri).then((response) => response.blob());
    form.append("file", new File([blob], asset.fileName ?? "avatar", { type: asset.mimeType ?? blob.type }));
  } else {
    form.append("file", { uri: asset.uri, name: asset.fileName ?? "avatar", type: asset.mimeType ?? "image/jpeg" } as unknown as Blob);
  }
  return form;
}

export async function uploadAvatar(asset: AvatarAsset): Promise<SelfUser> {
  return apiClient<SelfUser>("/users/me/avatar", { method: "POST", body: await toFormData(asset) });
}

export async function deleteAvatar(): Promise<void> {
  await apiClient<null>("/users/me/avatar", { method: "DELETE" });
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiClient<NotificationPreferences>("/notifications/preferences");
}
export async function updateNotificationPreferences(body: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  return apiClient<NotificationPreferences>("/notifications/preferences", { method: "PATCH", body });
}
export async function getPrivacyPreferences(): Promise<PrivacyPreferences> {
  return apiClient<PrivacyPreferences>("/privacy/preferences");
}
export async function updatePrivacyPreferences(body: Partial<PrivacyPreferences>): Promise<PrivacyPreferences> {
  return apiClient<PrivacyPreferences>("/privacy/preferences", { method: "PATCH", body });
}
export async function getLocationPreferences(): Promise<LocationPreferences> {
  return apiClient<LocationPreferences>("/locations/preferences");
}
export async function updateLocationPreferences(body: Partial<LocationPreferences>): Promise<LocationPreferences> {
  return apiClient<LocationPreferences>("/locations/preferences", { method: "PATCH", body });
}

function syncSelfUser(user: SelfUser): void {
  useUserStore.getState().setUser(user);
}

export function useMeQuery() {
  return useQuery({ queryKey: profileQueryKeys.me, queryFn: getMe });
}
export function useUpdateProfileMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updateProfile, onSuccess: (user) => { client.setQueryData(profileQueryKeys.me, user); syncSelfUser(user); } });
}
export function useUploadAvatarMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: uploadAvatar, onSuccess: (user) => { client.setQueryData(profileQueryKeys.me, user); syncSelfUser(user); } });
}
export function useDeleteAvatarMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteAvatar, onSuccess: async () => { const user = await getMe(); client.setQueryData(profileQueryKeys.me, user); syncSelfUser(user); } });
}
export function useNotificationPreferencesQuery() { return useQuery({ queryKey: profileQueryKeys.notificationPreferences, queryFn: getNotificationPreferences }); }
export function useUpdateNotificationPreferencesMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updateNotificationPreferences, onSuccess: (value) => client.setQueryData(profileQueryKeys.notificationPreferences, value) });
}
export function usePrivacyPreferencesQuery() { return useQuery({ queryKey: profileQueryKeys.privacyPreferences, queryFn: getPrivacyPreferences }); }
export function useUpdatePrivacyPreferencesMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updatePrivacyPreferences, onSuccess: (value) => client.setQueryData(profileQueryKeys.privacyPreferences, value) });
}
export function useLocationPreferencesQuery() { return useQuery({ queryKey: profileQueryKeys.locationPreferences, queryFn: getLocationPreferences }); }
export function useUpdateLocationPreferencesMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updateLocationPreferences, onSuccess: (value) => client.setQueryData(profileQueryKeys.locationPreferences, value) });
}
