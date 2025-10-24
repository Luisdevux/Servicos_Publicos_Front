// src/hooks/useAuth.ts
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLogout, getAccessToken } from './useAuthMutations';
import { authService } from '@/services';
import type { LoginResponse } from '@/types';

interface UserData {
  _id: string;
  nome: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  nivel_acesso: {
    municipe: boolean;
    operador: boolean;
    secretario: boolean;
    administrador: boolean;
  };
}

async function fetchCurrentUser(): Promise<UserData | null> {
  const token = getAccessToken();
  
  if (!token) {
    return null;
  }

  try {
    // Verifica se tem dados salvos no localStorage (para persistência entre reloads)
    const cachedUser = localStorage.getItem('user_data');
    if (cachedUser) {
      return JSON.parse(cachedUser) as UserData;
    }

    // Valida o token com a API
    const response = await authService.introspect(token);
    
    if (response.valid && response.user) {
      // Salva os dados do usuário no localStorage
      localStorage.setItem('user_data', JSON.stringify(response.user));
      return response.user as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    // Se o token expirou, limpa os dados
    localStorage.removeItem('user_data');
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: true, // Revalida quando a janela ganha foco
  });

  const logoutMutation = useLogout();

  // Limpa dados do usuário se houver erro de autenticação
  useEffect(() => {
    if (error) {
      localStorage.removeItem('user_data');
      queryClient.setQueryData(['currentUser'], null);
    }
  }, [error, queryClient]);

  // Função para atualizar dados do usuário (após login)
  const setUser = (userData: LoginResponse['user']) => {
    const user: UserData = {
      _id: userData._id,
      nome: userData.nome,
      email: userData.email,
      cpf: userData.cpf,
      cnpj: userData.cnpj as string | undefined,
      nivel_acesso: {
        municipe: userData.nivel_acesso?.municipe || false,
        operador: userData.nivel_acesso?.operador || false,
        secretario: userData.nivel_acesso?.secretario || false,
        administrador: userData.nivel_acesso?.administrador || false,
      },
    };
    
    localStorage.setItem('user_data', JSON.stringify(user));
    queryClient.setQueryData(['currentUser'], user);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user || !!getAccessToken(),
    logout: () => {
      localStorage.removeItem('user_data');
      logoutMutation.mutate();
    },
    setUser, // Expõe função para atualizar usuário
  };
}
