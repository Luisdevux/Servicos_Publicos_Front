// src/hooks/useDemandaMutations.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { demandaService } from '@/services';
import type { Endereco, Demanda, TipoDemanda, UpdateDemandaData } from '@/types';

interface CreateDemandaInput {
  tipo: TipoDemanda;
  descricao: string;
  endereco: Endereco;
  imagens?: File[];
  tipoImagem?: 'solicitacao' | 'resolucao';
  onUploadProgress?: (progress: { current: number; total: number; percentage: number }) => void;
}

export function useCreateDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDemandaInput): Promise<Demanda> => {
      let demandaCriada: Demanda | undefined = undefined;

      // Validação: imagens são obrigatórias
      if (!input.imagens || input.imagens.length === 0) {
        throw new Error('Pelo menos uma imagem é obrigatória para criar a demanda');
      }

      try {
        // Primeira requisição: criar a demanda
        const demandaData = {
          tipo: input.tipo,
          descricao: input.descricao,
          endereco: input.endereco,
          tipoImagem: 'solicitacao',
          status: 'Em aberto',
        };

        const response = await demandaService.criarDemanda(demandaData);
        demandaCriada = response.data;

        if (!demandaCriada) {
          throw new Error('Erro ao criar demanda - dados não retornados');
        }

        // Segunda requisição: upload das imagens (se houver)
        if (input.imagens && input.imagens.length > 0 && demandaCriada._id) {
          const uploadErrors: string[] = [];
          const totalImages = input.imagens.length;

          try {
            // Upload de todas as imagens sequencialmente
            for (let i = 0; i < input.imagens.length; i++) {
              try {
                // Notificar progresso
                if (input.onUploadProgress) {
                  input.onUploadProgress({
                    current: i + 1,
                    total: totalImages,
                    percentage: Math.round(((i + 1) / totalImages) * 100),
                  });
                }

                const uploadResult = await demandaService.uploadFotoDemanda(
                  demandaCriada._id,
                  input.imagens[i],
                  'solicitacao'
                );

                // Atualiza o objeto demandaCriada com o link da imagem principal (primeira)
                if (i === 0 && uploadResult.data?.link_imagem) {
                  demandaCriada.link_imagem = uploadResult.data.link_imagem;
                }

                console.log(`Upload da imagem ${i + 1}/${input.imagens.length} realizado com sucesso`);
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                console.error(`Erro no upload da imagem ${i + 1}:`, err);
                uploadErrors.push(`Imagem ${i + 1}: ${errorMessage}`);
              }
            }

            // Se algum upload falhou, tenta deletar a demanda e lança erro
            if (uploadErrors.length > 0) {
              console.error('Tentando fazer rollback da demanda criada...');
              try {
                await demandaService.deletarDemanda(demandaCriada._id);
                console.log('Rollback realizado com sucesso');
              } catch (deleteErr) {
                console.error('Erro ao fazer rollback da demanda:', deleteErr);
                // Mesmo que o rollback falhe, informamos sobre o erro do upload
              }

              throw new Error(
                `Falha no upload das imagens. A demanda não foi criada.\n${uploadErrors.join('\n')}`
              );
            }
          } catch (uploadError) {
            // Se o erro já foi tratado acima, relança
            if (uploadError instanceof Error && uploadError.message.includes('Falha no upload')) {
              throw uploadError;
            }
            
            // Trata erros inesperados
            console.error('Erro inesperado durante o upload:', uploadError);
            
            try {
              await demandaService.deletarDemanda(demandaCriada._id);
              console.log('Rollback realizado com sucesso');
            } catch (deleteErr) {
              console.error('Erro ao fazer rollback:', deleteErr);
            }
            
            throw new Error(
              uploadError instanceof Error 
                ? `Erro no upload de imagens: ${uploadError.message}` 
                : 'Erro desconhecido no upload de imagens'
            );
          }
        }

        return demandaCriada;
      } catch (error) {
        console.error('Erro na criação da demanda:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['tipoDemanda'] });
    },
  });
}

export function useUpdateDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDemandaData }): Promise<Demanda> => {
      const response = await demandaService.atualizarDemanda(id, data);
      
      if (!response.data) {
        throw new Error('Erro ao atualizar demanda - dados não retornados');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });
}
