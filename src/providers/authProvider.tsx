// src/providers/authProvider.tsx
'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({});

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Verifica se há tokens salvos ao montar
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    const userData = localStorage.getItem('user_data');

    // Se não tem tokens mas tem dados do usuário, limpa
    if (!accessToken && !refreshToken && userData) {
      localStorage.removeItem('user_data');
      queryClient.setQueryData(['currentUser'], null);
    }

    // Verifica periodicamente se o usuário ainda está autenticado
    const checkAuthInterval = setInterval(() => {
      const token = Cookies.get('access_token');
      const user = queryClient.getQueryData(['currentUser']);
      
      // Se perdeu o token mas ainda tem dados do usuário no cache, limpa
      if (!token && user) {
        localStorage.removeItem('user_data');
        queryClient.setQueryData(['currentUser'], null);
      }
    }, 60000); // Verifica a cada 1 minuto

    return () => clearInterval(checkAuthInterval);
  }, [queryClient]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
