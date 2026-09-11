import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, apiClientWithMeta } from '@/services/api/client';
import { parsePaginationHeaders, type PaginatedResult } from '@/services/api/pagination';
import { friendKeys } from '@/services/api/query-keys';
export type PublicUser = { id:string; name:string; avatar:string|null; bio?:string|null; status:string; lastSeenAt?:string|null };
export type Friend = PublicUser;
export type FriendRequest = { id:string; requesterId:string; addresseeId:string; status:'PENDING'|'ACCEPTED'|'REJECTED'; createdAt:string; requester?:PublicUser; addressee?:PublicUser };
export type PaginationParams = { page?:number; limit?:number };
const qs=(p:PaginationParams={})=>{const q=new URLSearchParams();q.set('page',String(Math.max(1,p.page??1)));q.set('limit',String(Math.min(100,Math.max(1,p.limit??100))));return q.toString()};
export async function listFriends(p:PaginationParams={}):Promise<PaginatedResult<Friend>>{const r=await apiClientWithMeta<Friend[]>(`/friends?${qs(p)}`);return parsePaginationHeaders(r.data,r.headers)}
export async function listFriendRequests(p:PaginationParams={}):Promise<PaginatedResult<FriendRequest>>{const r=await apiClientWithMeta<FriendRequest[]>(`/friends/requests?${qs(p)}`);return parsePaginationHeaders(r.data,r.headers)}
export const sendFriendRequestResource=(id:string)=>apiClient<FriendRequest>('/friends/request',{method:'POST',body:{addresseeId:id}});
export const acceptFriendRequestResource=(id:string)=>apiClient<FriendRequest>(`/friends/requests/${encodeURIComponent(id)}/accept`,{method:'PATCH'});
export const rejectFriendRequestResource=(id:string)=>apiClient<FriendRequest>(`/friends/requests/${encodeURIComponent(id)}/reject`,{method:'PATCH'});
export const removeFriendResource=(id:string)=>apiClient<unknown>(`/friends/${encodeURIComponent(id)}`,{method:'DELETE'});
export function useFriendsQuery(p:PaginationParams={}){return useQuery({queryKey:friendKeys.list(p),queryFn:()=>listFriends(p),staleTime:15000})}
export function useFriendRequestsQuery(p:PaginationParams={}){return useQuery({queryKey:friendKeys.requests(p),queryFn:()=>listFriendRequests(p),staleTime:10000})}
export function useFriendMutation(action:'send'|'accept'|'reject'|'remove'){const c=useQueryClient();return useMutation({mutationFn:(id:string)=>action==='send'?sendFriendRequestResource(id):action==='accept'?acceptFriendRequestResource(id):action==='reject'?rejectFriendRequestResource(id):removeFriendResource(id),onSuccess:()=>{void c.invalidateQueries({queryKey:friendKeys.all})}})}