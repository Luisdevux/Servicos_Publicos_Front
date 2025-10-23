// src/hooks/useAuth.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useLogout, getAccessToken } from './useAuthMutations';
import { authService } from '@/services';
import type { UserType } from '@/lib/auth';
import type { Usuarios } from '@/types';

async function fetchCurrentUser(): Promise<Usuarios | null> {
  const token = getAccessToken();
  
  if (!token) {
    return null;
  }

  try {
    // Valida o token com a API
    const result = await authService.introspect(token);
    if (result.valid && result.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return null;
  }
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // Não tenta novamente se for erro de autenticação
      if (error && 'status' in error && (error.status === 401 || error.status === 498)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const logoutMutation = useLogout();

  return {
    user,
    isLoading,
    isAuthenticated: !!getAccessToken(), // Baseado apenas no token
    logout: () => logoutMutation.mutate(),
  };
}
