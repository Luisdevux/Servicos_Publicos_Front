// src/hooks/useUpdateColaborador.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuarioService } from '@/services/usuarioService';
import type { UpdateUsuariosData } from '@/types';

interface UseUpdateColaboradorOptions {
  onSuccess?: () => void;
}

export function useUpdateColaborador(usuarioId: string, options?: UseUpdateColaboradorOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateUsuariosData) => {
      return await usuarioService.atualizarUsuario(usuarioId, data);
    },
    onSuccess: () => {
      // Invalida a query de usuários para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      
      toast.success('Colaborador atualizado com sucesso!');
      
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const defaultMsg = error instanceof Error ? error.message : 'Erro ao atualizar colaborador';
      const data = (error as { data?: unknown })?.data;
      const errors = Array.isArray((data as { errors?: unknown[] })?.errors) 
        ? (data as { errors: unknown[] }).errors 
        : [];

      if (errors.length > 0) {
        errors.forEach((err: unknown) => {
          const msg = typeof (err as { message?: unknown })?.message === 'string' 
            ? (err as { message: string }).message 
            : defaultMsg;
          toast.error('Erro na atualização', {
            description: msg,
          });
        });
      } else {
        toast.error('Erro na atualização', {
          description: defaultMsg,
        });
      }
    },
  });

  return {
    updateColaborador: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
