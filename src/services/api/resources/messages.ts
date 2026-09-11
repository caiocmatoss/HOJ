import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiClientWithMeta } from "@/services/api/client";
import { parsePaginationHeaders, type PaginatedResult } from "@/services/api/pagination";
import { messageKeys } from "@/services/api/query-keys";

export type MessageUser = { id: string; name: string; avatar: string | null; status: string; lastSeenAt?: string | null };
export type GroupMessage = { id: string; groupId: string; userId: string; text: string; createdAt: string; updatedAt?: string; user?: MessageUser };
export type DirectMessage = { id: string; senderId: string; receiverId: string; text: string; createdAt: string; updatedAt?: string; sender?: MessageUser; receiver?: MessageUser };
export type MessagePagination = { page?: number; limit?: number };
const qs = (p: MessagePagination = {}) => `page=${Math.max(1, p.page ?? 1)}&limit=${Math.min(100, Math.max(1, p.limit ?? 100))}`;
export async function listGroupMessages(groupId: string, p: MessagePagination = {}): Promise<PaginatedResult<GroupMessage>> { const r = await apiClientWithMeta<GroupMessage[]>(`/groups/${encodeURIComponent(groupId)}/messages?${qs(p)}`); return parsePaginationHeaders(r.data, r.headers); }
export async function listDirectMessages(userId: string, p: MessagePagination = {}): Promise<PaginatedResult<DirectMessage>> { const r = await apiClientWithMeta<DirectMessage[]>(`/direct-messages/${encodeURIComponent(userId)}?${qs(p)}`); return parsePaginationHeaders(r.data, r.headers); }
export const sendGroupMessageResource = (groupId: string, text: string) => apiClient<GroupMessage>(`/groups/${encodeURIComponent(groupId)}/messages`, { method: "POST", body: { text } });
export const sendDirectMessageResource = (userId: string, text: string) => apiClient<DirectMessage>(`/direct-messages/${encodeURIComponent(userId)}`, { method: "POST", body: { text } });
export function useGroupMessagesQuery(groupId?: string, p: MessagePagination = {}) { return useQuery({ queryKey: messageKeys.group(groupId ?? "", p), queryFn: () => listGroupMessages(groupId as string, p), enabled: Boolean(groupId) }); }
export function useDirectMessagesQuery(userId?: string, p: MessagePagination = {}) { return useQuery({ queryKey: messageKeys.direct(userId ?? "", p), queryFn: () => listDirectMessages(userId as string, p), enabled: Boolean(userId) }); }
export function useSendGroupMessageMutation() { const c = useQueryClient(); return useMutation({ mutationFn: ({ groupId, text }: { groupId: string; text: string }) => sendGroupMessageResource(groupId, text), onSuccess: (_, v) => { void c.invalidateQueries({ queryKey: messageKeys.group(v.groupId) }); void c.invalidateQueries({ queryKey: messageKeys.inbox() }); void c.invalidateQueries({ queryKey: messageKeys.unreadCount }); } }); }
export function useSendDirectMessageMutation() { const c = useQueryClient(); return useMutation({ mutationFn: ({ userId, text }: { userId: string; text: string }) => sendDirectMessageResource(userId, text), onSuccess: (_, v) => { void c.invalidateQueries({ queryKey: messageKeys.direct(v.userId) }); void c.invalidateQueries({ queryKey: messageKeys.inbox() }); void c.invalidateQueries({ queryKey: messageKeys.unreadCount }); } }); }
export type ChatInboxItem = { threadType: "DIRECT" | "GROUP"; threadKey: string; peerUserId?: string; groupId?: string; title: string; avatar: string | null; lastMessage: { id: string; text: string; createdAt: string; sender?: MessageUser }; unreadCount: number };
export async function listChatInbox(p: MessagePagination = {}): Promise<PaginatedResult<ChatInboxItem>> { const r = await apiClientWithMeta<ChatInboxItem[]>(`/messages/inbox?${qs(p)}`); return parsePaginationHeaders(r.data, r.headers); }
export async function getChatUnreadCount(): Promise<number> { const result = await apiClient<{ count: number }>("/messages/unread/count"); return result.count; }
export async function markChatThreadRead(input: { threadType: "DIRECT" | "GROUP"; threadKey: string; messageId?: string }) { return apiClient(`/messages/read`, { method: "POST", body: input }); }
export type DirectReadCursor = { lastReadAt: string | null; lastReadMessageId: string | null };
export type DirectReadState = { threadType: "DIRECT"; threadKey: string; self: DirectReadCursor; peer: DirectReadCursor };
export async function getDirectReadState(peerUserId: string): Promise<DirectReadState> { return apiClient<DirectReadState>(`/messages/read-state/direct/${encodeURIComponent(peerUserId)}`); }
export function useChatInboxQuery(p: MessagePagination = {}) { return useQuery({ queryKey: messageKeys.inbox(p), queryFn: () => listChatInbox(p) }); }
export function useChatUnreadCountQuery() { return useQuery({ queryKey: messageKeys.unreadCount, queryFn: getChatUnreadCount }); }
export function useDirectReadStateQuery(peerUserId?: string) { return useQuery({ queryKey: messageKeys.directReadState(peerUserId ?? ""), queryFn: () => getDirectReadState(peerUserId as string), enabled: Boolean(peerUserId) }); }
export function useMarkChatReadMutation() { const c = useQueryClient(); return useMutation({ mutationFn: markChatThreadRead, onSuccess: () => { void c.invalidateQueries({ queryKey: messageKeys.inbox() }); void c.invalidateQueries({ queryKey: messageKeys.unreadCount }); } }); }
