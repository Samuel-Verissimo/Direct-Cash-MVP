import { request, ACCESS_TOKEN_STORAGE_KEY } from './client';
import type { AuthSession, AuthUser } from '../types/auth.types';

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<AuthSession> {
  return request<AuthSession>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthSession> {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/me', {
    method: 'GET',
    token,
  });
}

export async function logoutUser(token: string): Promise<void> {
  await request<void>('/auth/logout', {
    method: 'POST',
    token,
  });
}

export function loadAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function saveAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}
