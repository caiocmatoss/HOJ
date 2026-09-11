import { apiClient, beginSessionTermination, clearSession } from './client';
import { clearRefreshToken, getRefreshToken, setRefreshToken } from '@/services/auth/session-storage';
import { useUserStore } from '@/store/user-store';
import type { AuthResponse, AuthUser } from './types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>('/auth/login', { method: 'POST', authenticated: false, body: { email, password } });
  await setRefreshToken(result.refreshToken);
  useUserStore.getState().setSession(result.user, result.accessToken);
  return result;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>('/auth/register', { method: 'POST', authenticated: false, body: { name, email, password } });
  await setRefreshToken(result.refreshToken);
  useUserStore.getState().setSession(result.user, result.accessToken);
  return result;
}

export async function restoreSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    useUserStore.getState().setUnauthenticated();
    return false;
  }
  try {
    await import('./client').then(({ refreshSingleFlight }) => refreshSingleFlight());
    const user = await apiClient<AuthUser>('/auth/me');
    useUserStore.getState().setSession(user, useUserStore.getState().accessToken!);
    return true;
  } catch {
    useUserStore.getState().setUnauthenticated();
    return false;
  }
}

export async function logout(): Promise<void> {
  beginSessionTermination();
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) await apiClient<void>('/auth/logout', { method: 'POST', authenticated: false, body: { refreshToken }, retryOnUnauthorized: false });
  } catch {
    // Local cleanup must complete even when the backend is unreachable.
  } finally {
    await clearSession();
  }
}

export async function logoutAll(): Promise<void> {
  beginSessionTermination();
  try {
    await apiClient<void>('/auth/logout-all', { method: 'POST' });
  } finally {
    await clearSession();
  }
}

export async function getMe(): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/me');
}
