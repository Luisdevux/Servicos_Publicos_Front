// src/hooks/useDemandaMutations.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from './useAuthMutations';
import type { Endereco, Demanda } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

interface CreateDemandaInput {
  tipo: string;
  descricao: string;
  endereco: Endereco;
  imagem?: File;
}

async function createDemandaRequest(input: CreateDemandaInput): Promise<Demanda> {
  const token = getAccessToken();

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

  const response = await fetch(`${API_URL}/demandas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(demandaData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar demanda');
  }

  const result = await response.json();
  const demandaCriada = result.data;

  // Segunda requisição: upload da imagem (se houver)
  if (input.imagem && demandaCriada._id) {
    const formData = new FormData();
    formData.append('file', input.imagem, input.imagem.name || 'imagem.jpg');

    try {
      const uploadResponse = await fetch(
        `${API_URL}/demandas/${demandaCriada._id}/foto/demanda`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        console.error('Erro ao fazer upload da imagem:', uploadError);
        throw new Error(uploadError.message || 'Erro ao fazer upload da imagem');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload de imagem realizado com sucesso:', uploadResult);

      // Atualiza o objeto demandaCriada com o link da imagem
      if (uploadResult.dados?.link_imagem) {
        demandaCriada.link_imagem = uploadResult.dados.link_imagem;
      }
    } catch (uploadError) {
      console.error('Erro no upload da imagem:', uploadError);
      // Não lança erro para não quebrar a criação da demanda
      // A demanda foi criada, apenas o upload falhou
    }
  }

  return demandaCriada;
}

export function useCreateDemanda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDemandaRequest,
    onSuccess: () => {
      // Invalida queries relacionadas a demandas para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });
}
