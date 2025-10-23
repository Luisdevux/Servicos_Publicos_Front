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

function saveTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Se "lembrar de mim" está marcado, usa tempos maiores, senão usa sessão
  const cookieOptions = {
    secure: isProduction,
    sameSite: 'strict' as const,
    ...(rememberMe ? { expires: 30 } : {}), // 30 dias se lembrar, senão sessão (sem expires)
  };
  
  Cookies.set('access_token', accessToken, { 
    ...cookieOptions,
    expires: rememberMe ? 7 : undefined, // 7 dias para access token
  });
  
  Cookies.set('refresh_token', refreshToken, cookieOptions);
  
  // Salva a preferência de "lembrar de mim"
  if (rememberMe) {
    localStorage.setItem('remember_me', 'true');
  } else {
    localStorage.removeItem('remember_me');
  }
}

function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

export function useLogin(expectedUserType?: UserType | UserType[]) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data, variables) => {
      // Verifica se o tipo de usuário logado corresponde ao esperado
      if (expectedUserType) {
        const nivelAcesso = {
          municipe: data.user.nivel_acesso?.municipe || false,
          operador: data.user.nivel_acesso?.operador || false,
          secretario: data.user.nivel_acesso?.secretario || false,
          administrador: data.user.nivel_acesso?.administrador || false,
        };
        const userType = getUserTypeFromLevel(nivelAcesso);
        
        // Se expectedUserType for um array, verifica se o userType está nele
        const allowedTypes = Array.isArray(expectedUserType) ? expectedUserType : [expectedUserType];
        
        if (!allowedTypes.includes(userType)) {
          const allowedNames = allowedTypes.map(type => {
            switch(type) {
              case 'municipe': return 'munícipes';
              case 'administrador': return 'administradores';
              case 'operador': return 'operadores';
              case 'secretaria': return 'secretários';
              default: return type;
            }
          }).join(', ');
          
          throw new Error(
            `Acesso negado. Esta tela é exclusiva para ${allowedNames}.`
          );
        }
      }
      
      // Salva tokens com opção de "lembrar de mim"
      const rememberMe = variables.lembrarDeMim ?? false;
      saveTokens(data.user.accessToken, data.user.refreshtoken, rememberMe);
      
      // Salva dados do usuário no localStorage para persistência
      const userData = {
        _id: data.user._id,
        nome: data.user.nome,
        email: data.user.email,
        cpf: data.user.cpf,
        cnpj: data.user.cnpj,
        nivel_acesso: data.user.nivel_acesso,
      };
      localStorage.setItem('user_data', JSON.stringify(userData));
      queryClient.setQueryData(['currentUser'], userData);

      // Redireciona baseado no nível de acesso
      try {
        const nivelAcesso = data.user.nivel_acesso || {};
        
        // Prioridade: administrador > secretário > operador > munícipe
        if (nivelAcesso.administrador) {
          router.push('/admin/dashboard');
          return;
        }
        
        if (nivelAcesso.secretario) {
          router.push('/secretaria/dashboard');
          return;
        }
        
        if (nivelAcesso.operador) {
          router.push('/operador/dashboard');
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
      localStorage.removeItem('user_data');
      localStorage.removeItem('remember_me');
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
