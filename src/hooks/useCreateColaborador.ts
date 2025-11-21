// src/hooks/useCreateColaborador.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuarioService } from '@/services/usuarioService';
import type { CreateUsuariosData } from '@/types';

interface UseCreateColaboradorOptions {
  onSuccess?: () => void;
}

export function useCreateColaborador(options?: UseCreateColaboradorOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateUsuariosData) => {
      return await usuarioService.criarUsuario(data);
    },
    onSuccess: () => {
      // Invalida a query de usuários para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      
      toast.success('Colaborador criado com sucesso!', {
        description: 'Um email foi enviado para que o colaborador defina sua senha.',
      });
      
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const defaultMsg = error instanceof Error ? error.message : 'Erro ao criar colaborador';
      const data = (error as { data?: unknown })?.data;
      const errors = Array.isArray((data as { errors?: unknown[] })?.errors) 
        ? (data as { errors: unknown[] }).errors 
        : [];

      if (errors.length > 0) {
        errors.forEach((err: unknown) => {
          const msg = typeof (err as { message?: unknown })?.message === 'string' 
            ? (err as { message: string }).message 
            : defaultMsg;
          toast.error('Erro no cadastro', {
            description: msg,
          });
        });
      } else {
        toast.error('Erro no cadastro', {
          description: defaultMsg,
        });
      }
    },
  });

  return {
    createColaborador: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}
