import { BACKEND_URL } from '@/config/backend';
import { disconnectSocket, reauthenticateSocket } from '@/services/socket';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from '@/services/auth/session-storage';
import { useUserStore } from '@/store/user-store';
import { ApiError, toApiError } from './errors';
import type { RefreshResponse } from './types';
import { queryClient } from '@/providers/query-client';

export const API_URL = BACKEND_URL;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
  headers?: Record<string, string>;
};

let refreshFlight: Promise<string | null> | null = null;
let sessionGeneration = 0;

export function beginSessionTermination(): void {
  sessionGeneration += 1;
}

function isAuthEndpoint(path: string): boolean {
  return /^\/auth\/(login|register|refresh|forgot-password|reset-password)/.test(path);
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

async function refreshAccessToken(): Promise<string | null> {
  const generationAtStart = sessionGeneration;
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = await readPayload(response);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) await clearRefreshToken();
    throw toApiError(response.status, payload);
  }
  const result = payload as RefreshResponse;
  if (!result?.accessToken || !result.refreshToken) throw new ApiError(502, 'Sessão inválida.');
  if (generationAtStart !== sessionGeneration) throw new ApiError(401, 'Sessão encerrada.');
  await setRefreshToken(result.refreshToken);
  useUserStore.getState().setAccessToken(result.accessToken);
  reauthenticateSocket(result.accessToken);
  return result.accessToken;
}

export async function refreshSingleFlight(): Promise<string | null> {
  if (!refreshFlight) {
    refreshFlight = refreshAccessToken().catch(async (error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        disconnectSocket();
        useUserStore.getState().clearAuth();
      }
      throw error;
    }).finally(() => { refreshFlight = null; });
  }
  return refreshFlight;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const authenticated = options.authenticated !== false;
  const token = authenticated ? useUserStore.getState().accessToken : null;
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = { ...(options.body !== undefined && !isMultipart ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : (isMultipart ? options.body as BodyInit : JSON.stringify(options.body)),
  });
  const payload = await readPayload(response);
  if (response.status === 401 && authenticated && options.retryOnUnauthorized !== false && !isAuthEndpoint(path)) {
    try {
      const nextToken = await refreshSingleFlight();
      if (nextToken) return apiClient<T>(path, { ...options, retryOnUnauthorized: false });
    } catch {
      // Session cleanup is handled by refreshSingleFlight; expose the original auth failure.
    }
  }
  if (!response.ok) throw toApiError(response.status, payload);
  return payload as T;
}

export async function clearSession(): Promise<void> {
  sessionGeneration += 1;
  await clearRefreshToken();
  disconnectSocket();
  useUserStore.getState().clearAuth();
  queryClient.clear();
}

export async function apiClientWithMeta<T>(path: string, options: RequestOptions = {}): Promise<{ data: T; status: number; headers: Headers }> {
  const authenticated = options.authenticated !== false;
  const token = authenticated ? useUserStore.getState().accessToken : null;
  const isMultipart = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = { ...(options.body !== undefined && !isMultipart ? { "Content-Type": "application/json" } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { method: options.method ?? "GET", headers, body: options.body === undefined ? undefined : (isMultipart ? options.body as BodyInit : JSON.stringify(options.body)) });
  const payload = await readPayload(response);
  if (response.status === 401 && authenticated && options.retryOnUnauthorized !== false && !isAuthEndpoint(path)) {
    const nextToken = await refreshSingleFlight().catch(() => null);
    if (nextToken) return apiClientWithMeta<T>(path, { ...options, retryOnUnauthorized: false });
  }
  if (!response.ok) throw toApiError(response.status, payload);
  return { data: payload as T, status: response.status, headers: response.headers };
}
