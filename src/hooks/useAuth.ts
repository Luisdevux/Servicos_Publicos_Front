// src/hooks/useAuth.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useLogout, getAccessToken } from './useAuthMutations';
import type { Usuarios } from '@/types';

async function fetchCurrentUser(): Promise<Usuarios | null> {
  const token = getAccessToken();
  
  if (!token) {
    return null;
  }

  // TODO: Implementar validação do token com a API
  
  return null;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const logoutMutation = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!user || !!getAccessToken(),
    logout: () => logoutMutation.mutate(),
  };
}
