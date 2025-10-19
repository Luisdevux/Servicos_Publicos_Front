// src/hooks/useAuthMutations.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getUserTypeFromLevel, type UserType } from '@/lib/auth';
import type { LoginCredentials, LoginResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao fazer login');
  }

  const data = await response.json();
  
  // A API retorna { data: { user: { accessToken, refreshtoken, ...userObject } } }
  return data.data as LoginResponse;
}

async function logoutRequest(accessToken: string): Promise<void> {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ access_token: accessToken }),
    });
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
