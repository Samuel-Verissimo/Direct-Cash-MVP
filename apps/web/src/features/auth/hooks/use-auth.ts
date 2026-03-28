'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearAccessToken,
  getCurrentUser,
  loadAccessToken,
  logoutUser,
  saveAccessToken,
  DirectCashApiError,
} from '@/lib/api';
import type { AuthSession, AuthUser } from '@/lib/types';

type SessionStatus = 'loading' | 'anonymous' | 'authenticated';

interface SessionState {
  status: SessionStatus;
  token: string | null;
  user: AuthUser | null;
  message: string | null;
}

const initialState: SessionState = {
  status: 'loading',
  token: null,
  user: null,
  message: null,
};

export function useAuth() {
  const [session, setSession] = useState<SessionState>(initialState);

  useEffect(() => {
    let mounted = true;

    async function bootstrap(): Promise<void> {
      const token = loadAccessToken();

      if (!token) {
        await Promise.resolve();
        if (!mounted) return;
        setSession({ status: 'anonymous', token: null, user: null, message: null });
        return;
      }

      try {
        const user = await getCurrentUser(token);
        if (!mounted) return;
        setSession({ status: 'authenticated', token, user, message: null });
      } catch (error) {
        if (!mounted) return;
        clearAccessToken();
        const message =
          error instanceof DirectCashApiError
            ? error.message
            : 'Sua sessão expirou. Entre novamente.';
        setSession({ status: 'anonymous', token: null, user: null, message });
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback((authSession: AuthSession): void => {
    saveAccessToken(authSession.accessToken);
    setSession({
      status: 'authenticated',
      token: authSession.accessToken,
      user: authSession.user,
      message: null,
    });
  }, []);

  const logout = useCallback(
    async (message?: string): Promise<void> => {
      if (session.token) {
        try {
          await logoutUser(session.token);
        } catch {
          /* best-effort */
        }
      }
      clearAccessToken();
      setSession({
        status: 'anonymous',
        token: null,
        user: null,
        message: message ?? null,
      });
    },
    [session.token],
  );

  const forceLogout = useCallback((message?: string): void => {
    clearAccessToken();
    setSession({
      status: 'anonymous',
      token: null,
      user: null,
      message: message ?? null,
    });
  }, []);

  return { session, login, logout, forceLogout };
}
