// src/hooks/useUserProfile.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuarioService';
import type { Usuarios } from '@/types';

/**
 * Hook para buscar dados completos do perfil do usuário
 * A sessão do NextAuth tem apenas dados básicos,
 * então precisamos buscar os dados completos da API
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID não fornecido');
      const response = await usuarioService.buscarUsuarioPorId(userId);
      return response.data as Usuarios;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });
}
