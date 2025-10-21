// src/hooks/useAuthMutations.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getUserTypeFromLevel, type UserType } from '@/lib/auth';
import { authService } from '@/services';
import type { LoginCredentials, LoginResponse } from '@/types';

async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  return authService.login(credentials);
}

async function logoutRequest(accessToken: string): Promise<void> {
  try {
    await authService.logout(accessToken);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}

function saveTokens(accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  Cookies.set('access_token', accessToken, { 
    expires: 7, 
    secure: isProduction, 
    sameSite: 'strict' 
  });
  Cookies.set('refresh_token', refreshToken, { 
    expires: 30, 
    secure: isProduction, 
    sameSite: 'strict' 
  });
}

function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

export function useLogin(expectedUserType?: UserType) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      // Verifica se o tipo de usuário logado corresponde ao esperado
      if (expectedUserType) {
        const nivelAcesso = {
          municipe: data.user.nivel_acesso.municipe || false,
          operador: data.user.nivel_acesso.operador || false,
          secretario: data.user.nivel_acesso.secretario || false,
          administrador: data.user.nivel_acesso.administrador || false,
        };
        const userType = getUserTypeFromLevel(nivelAcesso);
        
        if (userType !== expectedUserType) {
          throw new Error(
            `Acesso negado. Esta tela é exclusiva para ${
              expectedUserType === 'municipe' ? 'munícipes' :
              expectedUserType === 'administrador' ? 'administradores' :
              expectedUserType === 'operador' ? 'operadores' :
              'secretarias'
            }.`
          );
        }
      }
      
      saveTokens(data.user.accessToken, data.user.refreshtoken);
      queryClient.setQueryData(['user'], data.user);

      // Redireciona para a tela /admin se for administrador
      try {
        const nivelAcesso = data.user.nivel_acesso || {};
        const isAdmin = !!nivelAcesso.administrador;

        if (isAdmin) {
          router.push('/admin/dashboard');
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar nível de acesso:', err);
      }

      router.push('/');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = Cookies.get('access_token');
      if (accessToken) {
        await logoutRequest(accessToken);
      }
    },
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      router.push('/');
    },
  });
}

export function getAccessToken(): string | undefined {
  return Cookies.get('access_token');
}

export function getRefreshToken(): string | undefined {
  return Cookies.get('refresh_token');
}
