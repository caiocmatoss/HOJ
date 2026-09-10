import { BACKEND_URL } from "@/config/backend";
import { useUserStore } from "@/store/user-store";
import { disconnectSocket } from "@/services/socket";
import { apiClient as centralApiClient } from "@/services/api/client";
import { Platform } from "react-native";

export const API_URL = BACKEND_URL;

function invalidateExpiredSession(): void {
  const { accessToken } = useUserStore.getState();

  if (!accessToken) {
    return;
  }

  disconnectSocket();
  useUserStore.getState().clearAuth();
}

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  authenticated?: boolean;
};

export type CurrentUserResponse = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  username?: string | null;
  city?: string | null;
  phone?: string | null;
  status: "ONLINE" | "OFFLINE";
  createdAt?: string;
  updatedAt?: string;
};

export type ApiAuthResponse = {
  user: ApiUser;
  accessToken: string;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  username?: string | null;
  city?: string | null;
  phone?: string | null;
  status: "ONLINE" | "OFFLINE";
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationPreferences = {
  friendsNearby: boolean;
  newEvents: boolean;
  messages: boolean;
  eventReminders: boolean;
  friendCheckins: boolean;
  promotions: boolean;
  appUpdates: boolean;
  weeklyDigest: boolean;
};

export type LocationAccuracy = "HIGH" | "BALANCED";
export type LocationUpdateFrequency = "REALTIME" | "FIVE_MINUTES" | "FIFTEEN_MINUTES";
export type ApiLocationPreferences = {
  precise: boolean;
  accuracy: LocationAccuracy;
  updateFreq: LocationUpdateFrequency;
  shareWithFriends: boolean;
};

export async function getLocationPreferences(): Promise<ApiLocationPreferences> {
  return apiRequest<ApiLocationPreferences>("/locations/preferences");
}

export async function updateLocationPreferences(
  body: Partial<ApiLocationPreferences>,
): Promise<ApiLocationPreferences> {
  return apiRequest<ApiLocationPreferences>("/locations/preferences", { method: "PATCH", body });
}

export async function deleteMyLocation(): Promise<void> {
  await apiRequest<void>("/locations", { method: "DELETE" });
}

export type ApiPrivacyPreferences = { showStatus: boolean; showCheckinHistory: boolean };
export async function getPrivacyPreferences(): Promise<ApiPrivacyPreferences> { return apiRequest<ApiPrivacyPreferences>("/privacy/preferences"); }
export async function updatePrivacyPreferences(body: Partial<ApiPrivacyPreferences>): Promise<ApiPrivacyPreferences> { return apiRequest<ApiPrivacyPreferences>("/privacy/preferences", { method: "PATCH", body }); }

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiRequest<NotificationPreferences>("/notifications/preferences");
}

export async function updateNotificationPreferences(
  body: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return apiRequest<NotificationPreferences>("/notifications/preferences", {
    method: "PATCH",
    body,
  });
}

export type ApiFriend = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  status: "ONLINE" | "OFFLINE";
};

export type ApiDirectMessageUser = {
  id: string;
  name: string;
  avatar: string | null;
  status: string;
};

export type ApiGroupMessageUser = {
  id: string;
  name: string;
  avatar: string | null;
  status: string;
};

export type ApiGroupMessage = {
  id: string;
  groupId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  user?: ApiGroupMessageUser;
};

export type ApiDirectMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  sender?: ApiDirectMessageUser;
  receiver?: ApiDirectMessageUser;
};

export type ApiFriendRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export type ApiFriendRequestUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio?: string | null;
  status: "ONLINE" | "OFFLINE" | string;
};

export type ApiFriendRequest = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: ApiFriendRequestStatus;
  createdAt: string;

  requester?: ApiFriendRequestUser;

  addressee?: ApiFriendRequestUser;
};

export type ApiVenue = {
  id: string;
  name: string;
  category: string;
  address: string;

  latitude: number | string;
  longitude: number | string;

  occupancy: number;
  capacity: number | null;
  occupancyPercent: number | null;
  source: "MANUAL" | "IMPORTED";
  externalProvider: string | null;
  externalId: string | null;
  locality: string | null;
  region: string | null;
  country: string | null;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  sourceRefreshedAt: string | null;
  sourceClosedAt: string | null;


  description: string | null;

  image: string | null;

  rating: number | string | null;

  distance?: string;

  people: number;

  gallery?: string[];

  dj: string | null;

  promotion: string | null;

  playlist: string | null;

  status: "OPEN" | "CLOSED" | "open" | "closed";

  createdAt?: string;
  updatedAt?: string;
};

export type ApiFavorite = {
  id: string;
  userId: string;
  venueId: string;
  createdAt: string;
  venue: ApiVenue;
};

export type ApiCheckinUser = {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  city?: string | null;
  phone?: string | null;
  avatar: string | null;
  bio: string | null;
  status: string;
};

export type ApiCheckinVenue = {
  id: string;
  name: string;
  category?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  occupancy?: number;
  image?: string | null;
  rating?: number | string | null;
  status?: string;
};

export type ApiCheckin = {
  id: string;
  userId: string;
  venueId: string;
  checkedInAt: string;
  checkedOutAt: string | null;
  user?: ApiCheckinUser;
  venue?: ApiCheckinVenue;
};

export type ApiCheckinMutationResponse = {
  checkin: ApiCheckin;
  venue: {
    id: string;
    name: string;
    occupancy: number;
  } | null;
};
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

export type ApiUnreadNotificationCount = { count: number };
export type ApiInviteStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type ApiInviteUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: string;
};

export type ApiInviteGroup = {
  id: string;
  name: string;
  venueId: string;
};

export type ApiInvite = {
  id: string;
  groupId: string;
  senderId: string;
  receiverId: string;
  status: ApiInviteStatus;
  createdAt: string;
  respondedAt: string | null;
  group?: ApiInviteGroup;
  sender?: ApiInviteUser;
  receiver?: ApiInviteUser;
};

export type ApiAcceptInviteResponse = {
  invite: ApiInvite;
  member: {
    id: string;
    groupId: string;
    userId: string;
    joinedAt: string;
    user?: ApiInviteUser;
  };
};
export type ApiGroupMember = {
  id: string;
  userId: string;
  joinedAt: string;
  user?: ApiUser;
};

export type ApiGroup = {
  id: string;
  name: string;
  venueId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  venue?: Pick<ApiVenue, "id" | "name" | "category" | "address">;
  members?: ApiGroupMember[];
};
export type ApiEvent = {
  id: string;
  title: string;
  image: string | null;

  venueId: string;
  venueName: string | null;

  date: string;
  time: string;
  category: string;

  description: string | null;

  price: number | string | null;

  distance?: string;

  attendees: number;

  isLive: boolean;

  createdAt?: string;
  updatedAt?: string;

  venue?: {
    id: string;
    name: string;
    category: string;
    address: string;

    latitude: number | string;
    longitude: number | string;

    image: string | null;

    rating: number | string | null;

    status: "OPEN" | "CLOSED";
  };
};

type ApiListResponse<T> =
  | T[]
  | {
      value: T[];
      Count?: number;
      count?: number;
    };

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return centralApiClient<T>(path, {
    method: (options.method ?? "GET") as "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    body: options.body,
    authenticated: options.authenticated,
  });
}

export function resolveBackendMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return value.startsWith('/') ? `${API_URL}${value}` : value;
}

export type AvatarUploadAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export async function uploadMyAvatar(asset: AvatarUploadAsset): Promise<ApiUser> {
  const token = useUserStore.getState().accessToken;
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await fetch(asset.uri).then((response) => response.blob());
    form.append('file', new File([blob], asset.fileName ?? 'avatar', { type: asset.mimeType ?? blob.type }));
  } else {
    form.append('file', { uri: asset.uri, name: asset.fileName ?? 'avatar', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
  }
  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new Error(message ?? `Erro HTTP ${response.status}`);
  }
  return data as ApiUser;
}

function unwrapList<T>(
  response: ApiListResponse<T>,
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    Array.isArray(response.value)
  ) {
    return response.value;
  }

  return [];
}

/**
 * =====================================================
 * AUTH / CURRENT USER
 * =====================================================
 */

export async function login(email: string, password: string): Promise<ApiAuthResponse> {
  return apiRequest<ApiAuthResponse>("/auth/login", {
    method: "POST",
    authenticated: false,
    body: { email, password },
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<ApiAuthResponse> {
  return apiRequest<ApiAuthResponse>("/auth/register", {
    method: "POST",
    authenticated: false,
    body: { name, email, password },
  });
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>(
    "/auth/me",
  );
}

/**
 * =====================================================
 * USERS
 * =====================================================
 */

/**
 * Busca todos os usuários autenticados.
 *
 * GET /users
 */
export async function getUsers(): Promise<ApiUser[]> {
  const response =
    await apiRequest<
      ApiListResponse<ApiUser>
    >(
      "/users",
    );

  return unwrapList(response);
}

/**
 * Busca um usuário específico.
 *
 * GET /users/:id
 */
export async function getUser(
  id: string,
): Promise<ApiUser> {
  return apiRequest<ApiUser>(
    `/users/${encodeURIComponent(id)}`,
  );
}

/**
 * Busca o próprio usuário.
 *
 * GET /users/me
 */
export async function getMyUser(): Promise<ApiUser> {
  return apiRequest<ApiUser>(
    "/users/me",
  );
}

/**
 * Atualiza o próprio usuário.
 *
 * PATCH /users/me
 */
export async function updateMyUser(
  body: {
    name?: string;
    username?: string | null;
    city?: string | null;
    phone?: string | null;
    bio?: string | null;
    avatar?: string | null;
  },
): Promise<ApiUser> {
  return apiRequest<ApiUser>(
    "/users/me",
    {
      method: "PATCH",
      body,
    },
  );
}

/**
 * =====================================================
 * FRIENDS
 * =====================================================
 */

/**
 * Busca os amigos aceitos
 * do usuário autenticado.
 *
 * GET /friends
 */
export async function getFriends(): Promise<ApiFriend[]> {
  return apiRequest<ApiFriend[]>(
    "/friends",
  );
}

export async function getDirectMessages(
  userId: string,
): Promise<ApiDirectMessage[]> {
  return apiRequest<ApiDirectMessage[]>(
    `/direct-messages/${encodeURIComponent(userId)}`,
  );
}

/**
 * Envia uma solicitação de amizade.
 *
 * POST /friends/request
 *
 * Body:
 * {
 *   addresseeId: string
 * }
 */
export async function sendFriendRequest(
  addresseeId: string,
): Promise<ApiFriendRequest> {
  return apiRequest<ApiFriendRequest>(
    "/friends/request",
    {
      method: "POST",
      body: {
        addresseeId,
      },
    },
  );
}

/**
 * Busca solicitações de amizade
 * recebidas pelo usuário autenticado.
 *
 * GET /friends/requests
 */
export async function getFriendRequests(): Promise<
  ApiFriendRequest[]
> {
  return apiRequest<ApiFriendRequest[]>(
    "/friends/requests",
  );
}

/**
 * Aceita uma solicitação de amizade.
 *
 * PATCH /friends/requests/:id/accept
 */
export async function acceptFriendRequest(
  friendshipId: string,
): Promise<ApiFriendRequest> {
  return apiRequest<ApiFriendRequest>(
    `/friends/requests/${encodeURIComponent(friendshipId)}/accept`,
    {
      method: "PATCH",
    },
  );
}

/**
 * Rejeita uma solicitação de amizade.
 *
 * PATCH /friends/requests/:id/reject
 */
export async function rejectFriendRequest(
  friendshipId: string,
): Promise<ApiFriendRequest> {
  return apiRequest<ApiFriendRequest>(
    `/friends/requests/${encodeURIComponent(friendshipId)}/reject`,
    {
      method: "PATCH",
    },
  );
}

/**
 * Remove um amigo.
 *
 * DELETE /friends/:friendId
 */
export async function removeFriend(
  friendId: string,
): Promise<{
  message: string;
}> {
  return apiRequest<{
    message: string;
  }>(
    `/friends/${encodeURIComponent(friendId)}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Busca amigos próximos ao usuário.
 *
 * GET /friends/nearby
 */
export async function getMyCheckin(): Promise<ApiCheckin | null> {
  return apiRequest<ApiCheckin | null>("/checkins/me");
}

export async function getCheckinHistory(): Promise<ApiCheckin[]> {
  return apiRequest<ApiCheckin[]>("/checkins/history");
}

export async function getVenueCheckins(venueId: string): Promise<ApiCheckin[]> {
  return apiRequest<ApiCheckin[]>(`/venues/${encodeURIComponent(venueId)}/checkins`);
}

export async function checkIn(venueId: string): Promise<ApiCheckinMutationResponse> {
  return apiRequest<ApiCheckinMutationResponse>(`/checkins/${encodeURIComponent(venueId)}`, { method: "POST" });
}

export async function checkOut(venueId: string): Promise<ApiCheckinMutationResponse> {
  return apiRequest<ApiCheckinMutationResponse>(`/checkins/${encodeURIComponent(venueId)}/checkout`, { method: "PATCH" });
}

export async function removeCheckin(venueId: string): Promise<ApiCheckinMutationResponse> {
  return apiRequest<ApiCheckinMutationResponse>(`/checkins/${encodeURIComponent(venueId)}`, { method: "DELETE" });
}
export async function getNotifications(): Promise<ApiNotification[]> {
  return apiRequest<ApiNotification[]>("/notifications");
}

export async function getUnreadNotifications(): Promise<ApiNotification[]> {
  return apiRequest<ApiNotification[]>("/notifications/unread");
}

export async function getUnreadNotificationCount(): Promise<ApiUnreadNotificationCount> {
  return apiRequest<ApiUnreadNotificationCount>("/notifications/unread/count");
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiNotification> {
  return apiRequest<ApiNotification>(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" });
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  return apiRequest<{ updated: number }>("/notifications/read-all", { method: "PATCH" });
}
export async function getInvites(): Promise<ApiInvite[]> {
  return apiRequest<ApiInvite[]>("/invites");
}

export async function getSentInvites(): Promise<ApiInvite[]> {
  return apiRequest<ApiInvite[]>("/invites/sent");
}

export async function sendGroupInvite(
  groupId: string,
  receiverId: string,
): Promise<ApiInvite> {
  return apiRequest<ApiInvite>(
    `/groups/${encodeURIComponent(groupId)}/invites`,
    { method: "POST", body: { receiverId } },
  );
}

export async function acceptInvite(
  inviteId: string,
): Promise<ApiAcceptInviteResponse> {
  return apiRequest<ApiAcceptInviteResponse>(
    `/invites/${encodeURIComponent(inviteId)}/accept`,
    { method: "PATCH" },
  );
}

export async function rejectInvite(inviteId: string): Promise<ApiInvite> {
  return apiRequest<ApiInvite>(
    `/invites/${encodeURIComponent(inviteId)}/reject`,
    { method: "PATCH" },
  );
}
export async function getGroupMessages(groupId: string): Promise<ApiGroupMessage[]> {
  return apiRequest<ApiGroupMessage[]>(`/groups/${encodeURIComponent(groupId)}/messages`);
}

export async function sendGroupMessage(
  groupId: string,
  text: string,
): Promise<ApiGroupMessage> {
  return apiRequest<ApiGroupMessage>(`/groups/${encodeURIComponent(groupId)}/messages`, {
    method: "POST",
    body: { text },
  });
}

export async function getGroups(): Promise<ApiGroup[]> {
  return apiRequest<ApiGroup[]>("/groups");
}

export async function getGroup(id: string): Promise<ApiGroup> {
  return apiRequest<ApiGroup>(`/groups/${encodeURIComponent(id)}`);
}

export async function createGroup(name: string, venueId: string): Promise<ApiGroup> {
  return apiRequest<ApiGroup>("/groups", { method: "POST", body: { name, venueId } });
}

export async function getGroupMembers(groupId: string): Promise<ApiGroupMember[]> {
  return apiRequest<ApiGroupMember[]>(`/groups/${encodeURIComponent(groupId)}/members`);
}
export async function addGroupMember(groupId: string, userId: string): Promise<ApiGroupMember> {
  return apiRequest<ApiGroupMember>(`/groups/${encodeURIComponent(groupId)}/members`, { method: "POST", body: { userId } });
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  await apiRequest<unknown>(`/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`, { method: "DELETE" });
}

export async function deleteGroup(groupId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/groups/${encodeURIComponent(groupId)}`, { method: "DELETE" });
}

export async function getFavorites(): Promise<ApiFavorite[]> {
  return apiRequest<ApiFavorite[]>("/favorites");
}

export async function getFavorite(venueId: string): Promise<ApiFavorite> {
  return apiRequest<ApiFavorite>(`/favorites/${encodeURIComponent(venueId)}`);
}

export async function addFavorite(venueId: string): Promise<ApiFavorite> {
  return apiRequest<ApiFavorite>(`/favorites/${encodeURIComponent(venueId)}`, { method: "POST" });
}

export async function removeFavorite(venueId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/favorites/${encodeURIComponent(venueId)}`, { method: "DELETE" });
}

export async function getNearbyFriends(
  radiusKm = 10,
): Promise<{
  radiusKm: number;
  count: number;
  friends: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    status: string;
    latitude: number;
    longitude: number;
    locationUpdatedAt: string;
    distanceMeters: number;
    distanceKm: number;
  }>;
}> {
  return apiRequest<{
    radiusKm: number;
    count: number;
    friends: Array<{
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      bio: string | null;
      status: string;
      latitude: number;
      longitude: number;
      locationUpdatedAt: string;
      distanceMeters: number;
      distanceKm: number;
    }>;
  }>(
    `/friends/nearby?radiusKm=${encodeURIComponent(
      radiusKm,
    )}`,
  );
}

/**
 * =====================================================
 * VENUES
 * =====================================================
 */

export async function getVenues(options: { q?: string; limit?: number; category?: string; locality?: string; region?: string; country?: string; source?: "MANUAL" | "IMPORTED" } = { limit: 100 }): Promise<ApiVenue[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response =
    await apiRequest<
      ApiListResponse<ApiVenue>
    >(
      `/venues${suffix}`,
      {
        authenticated: false,
      },
    );

  return unwrapList(response);
}

export async function getVenue(
  id: string,
): Promise<ApiVenue> {
  return apiRequest<ApiVenue>(
    `/venues/${encodeURIComponent(id)}`,
    {
      authenticated: false,
    },
  );
}

/**
 * =====================================================
 * EVENTS
 * =====================================================
 */

export async function getEvents(): Promise<ApiEvent[]> {
  const response =
    await apiRequest<
      ApiListResponse<ApiEvent>
    >(
      "/events",
      {
        authenticated: false,
      },
    );

  return unwrapList(response);
}

export async function getEvent(
  id: string,
): Promise<ApiEvent> {
  return apiRequest<ApiEvent>(
    `/events/${encodeURIComponent(id)}`,
    {
      authenticated: false,
    },
  );
}
