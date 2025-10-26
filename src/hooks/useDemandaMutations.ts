// src/hooks/useDemandaMutations.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demandaServiceSecure } from '@/services';
import type { Endereco, Demanda } from '@/types';

/*
  �� SEGURANÇA: Hook refatorado para usar demandaServiceSecure
  
  - NÃO acessa tokens da sessão
  - Usa demandaServiceSecure que internamente usa secureFetch()
  - secureFetch() faz proxy via /api/auth/secure-fetch
  - Tokens são pegos do JWT no servidor de forma segura
*/

interface CreateDemandaInput {
  tipo: string;
  descricao: string;
  endereco: Endereco;
  imagem?: File;
}

export function useCreateDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDemandaInput): Promise<Demanda> => {
      // Primeira requisição: criar a demanda
      const demandaData = {
        tipo: input.tipo,
        descricao: input.descricao,
        endereco: input.endereco,
        status: 'Em aberto',
      };

      const response = await demandaServiceSecure.criarDemanda(demandaData);
      const demandaCriada = response.data;

      if (!demandaCriada) {
        throw new Error('Erro ao criar demanda - dados não retornados');
      }

      // Segunda requisição: upload da imagem (se houver)
      if (input.imagem && demandaCriada._id) {
        try {
          const uploadResult = await demandaServiceSecure.uploadFotoDemanda(
            demandaCriada._id,
            input.imagem
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
