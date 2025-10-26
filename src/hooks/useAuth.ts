// src/hooks/useAuth.ts

'use client';

import { useSession } from 'next-auth/react';
import { useLogout } from './useLogout';

export function useAuth() {
  const { data: session, status } = useSession();
  const { logout: performLogout } = useLogout();

  const logout = async () => {
    await performLogout({ silent: false });
  };

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    logout,
  };
}
