// src/hooks/useDemandaMutations.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { demandaService } from '@/services';
import type { Endereco, Demanda } from '@/types';

interface CreateDemandaInput {
  tipo: string;
  descricao: string;
  endereco: Endereco;
  imagem?: File;
}

export function useCreateDemanda() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (input: CreateDemandaInput): Promise<Demanda> => {
      const token = session?.user?.accesstoken;

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Primeira requisição: criar a demanda
      const demandaData = {
        tipo: input.tipo,
        descricao: input.descricao,
        endereco: input.endereco,
        status: 'Em aberto',
      };

      const response = await demandaService.criarDemanda(demandaData, token);
      const demandaCriada = response.data;

      if (!demandaCriada) {
        throw new Error('Erro ao criar demanda - dados não retornados');
      }

      // Segunda requisição: upload da imagem (se houver)
      if (input.imagem && demandaCriada._id) {
        try {
          const uploadResult = await demandaService.uploadFotoDemanda(
            demandaCriada._id,
            input.imagem,
            token
          );

          console.log('Upload de imagem realizado com sucesso:', uploadResult);

          // Atualiza o objeto demandaCriada com o link da imagem
          if (uploadResult.data?.link_imagem) {
            demandaCriada.link_imagem = uploadResult.data.link_imagem;
          }
        } catch (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          // Não lança erro para não quebrar a criação da demanda
          // A demanda foi criada, apenas o upload falhou
        }
      }

      return demandaCriada;
    },
    onSuccess: () => {
      // Invalida queries relacionadas a demandas para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });
}
