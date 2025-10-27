// src/hooks/useDemandaMutations.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demandaService } from '@/services';
import type { Endereco, Demanda, TipoDemanda } from '@/types';

interface CreateDemandaInput {
  tipo: TipoDemanda;
  descricao: string;
  endereco: Endereco;
  imagens?: File[];
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

      const response = await demandaService.criarDemanda(demandaData);
      const demandaCriada = response.data;

      if (!demandaCriada) {
        throw new Error('Erro ao criar demanda - dados não retornados');
      }

      // Segunda requisição: upload das imagens (se houver)
      if (input.imagens && input.imagens.length > 0 && demandaCriada._id) {
        try {
          // Upload da primeira imagem (principal)
          const uploadResult = await demandaService.uploadFotoDemanda(
            demandaCriada._id,
            input.imagens[0]
          );

          console.log('Upload da primeira imagem realizado com sucesso:', uploadResult);

          // Atualiza o objeto demandaCriada com o link da imagem principal
          if (uploadResult.data?.link_imagem) {
            demandaCriada.link_imagem = uploadResult.data.link_imagem;
          }

          // Upload das imagens adicionais (se houver)
          for (let i = 1; i < input.imagens.length; i++) {
            try {
              await demandaService.uploadFotoDemanda(
                demandaCriada._id,
                input.imagens[i]
              );
              console.log(`Upload da imagem ${i + 1} realizado com sucesso`);
            } catch (err) {
              console.error(`Erro no upload da imagem ${i + 1}:`, err);
            }
          }
        } catch (uploadError) {
          console.error('Erro no upload da imagem principal:', uploadError);
        }
      }

      return demandaCriada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });
}
