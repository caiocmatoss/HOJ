import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiClientWithMeta } from "@/services/api/client";
import { parsePaginationHeaders, type PaginatedResult } from "@/services/api/pagination";
import { inviteKeys, groupKeys } from "@/services/api/query-keys";
export type InviteUser = { id: string; name: string; avatar: string | null; status?: string };
export type Invite = { id: string; groupId: string; senderId: string; receiverId: string; status: "PENDING" | "ACCEPTED" | "REJECTED"; createdAt: string; respondedAt: string | null; group?: { id: string; name: string; venueId: string }; sender?: InviteUser; receiver?: InviteUser };
export type PaginationParams = { page?: number; limit?: number };
const qs = (p: PaginationParams = {}) => `page=${Math.max(1, p.page ?? 1)}&limit=${Math.min(100, Math.max(1, p.limit ?? 100))}`;
export async function listReceivedInvites(p: PaginationParams = {}): Promise<PaginatedResult<Invite>> { const r = await apiClientWithMeta<Invite[]>(`/invites?${qs(p)}`); return parsePaginationHeaders(r.data, r.headers); }
export async function listSentInvites(p: PaginationParams = {}): Promise<PaginatedResult<Invite>> { const r = await apiClientWithMeta<Invite[]>(`/invites/sent?${qs(p)}`); return parsePaginationHeaders(r.data, r.headers); }
export const sendInviteResource = (groupId: string, receiverId: string) => apiClient<Invite>(`/groups/${encodeURIComponent(groupId)}/invites`, { method: "POST", body: { receiverId } });
export const acceptInviteResource = (id: string) => apiClient<unknown>(`/invites/${encodeURIComponent(id)}/accept`, { method: "PATCH" });
export const rejectInviteResource = (id: string) => apiClient<Invite>(`/invites/${encodeURIComponent(id)}/reject`, { method: "PATCH" });
export function useReceivedInvitesQuery(p: PaginationParams = {}) { return useQuery({ queryKey: inviteKeys.received(p), queryFn: () => listReceivedInvites(p) }); }
export function useSentInvitesQuery(p: PaginationParams = {}) { return useQuery({ queryKey: inviteKeys.sent(p), queryFn: () => listSentInvites(p) }); }
export function useInviteMutation(action: "send" | "accept" | "reject") { const client = useQueryClient(); return useMutation({ mutationFn: (v: { id?: string; groupId?: string; receiverId?: string }) => action === "send" ? sendInviteResource(v.groupId as string, v.receiverId as string) : action === "accept" ? acceptInviteResource(v.id as string) : rejectInviteResource(v.id as string), onSuccess: () => { void client.invalidateQueries({ queryKey: inviteKeys.all }); if (action === "accept") void client.invalidateQueries({ queryKey: groupKeys.all }); } }); }
