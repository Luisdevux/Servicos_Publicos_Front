// src/services/demandaServiceSecure.ts

import { getSecure, postSecure, patchSecure, delSecure } from './api';
import type {
  Demanda,
  ApiResponse,
  PaginatedResponse,
  CreateDemandaData,
  UpdateDemandaData,
  AtribuirDemandaData,
  DevolverDemandaData,
  ResolverDemandaData,
} from '@/types';

/**
 * Service para gerenciar demandas (versão segura para client-side)
 * Rotas da API: /demandas, /demandas/:id, /demandas/:id/atribuir, etc.
 */
export const demandaServiceSecure = {
  /**
   * Busca todas as demandas
   */
  async buscarDemandas(): Promise<ApiResponse<PaginatedResponse<Demanda>>> {
    return getSecure<ApiResponse<PaginatedResponse<Demanda>>>('/demandas');
  },

  /**
   * Busca uma demanda por ID
   */
  async buscarDemandaPorId(id: string): Promise<ApiResponse<Demanda>> {
    return getSecure<ApiResponse<Demanda>>(`/demandas/${id}`);
  },

  /**
   * Cria uma nova demanda
   */
  async criarDemanda(data: CreateDemandaData): Promise<ApiResponse<Demanda>> {
    return postSecure<ApiResponse<Demanda>>('/demandas', data);
  },

  /**
   * Atualiza uma demanda
   */
  async atualizarDemanda(
    id: string,
    data: UpdateDemandaData
  ): Promise<ApiResponse<Demanda>> {
    return patchSecure<ApiResponse<Demanda>>(`/demandas/${id}`, data);
  },

  /**
   * Atribui demanda a usuários
   * PATCH /demandas/:id/atribuir
   */
  async atribuirDemanda(
    id: string,
    data: AtribuirDemandaData
  ): Promise<ApiResponse<Demanda>> {
    return patchSecure<ApiResponse<Demanda>>(`/demandas/${id}/atribuir`, data);
  },

  /**
   * Devolve uma demanda
   * PATCH /demandas/:id/devolver
   */
  async devolverDemanda(
    id: string,
    data: DevolverDemandaData
  ): Promise<ApiResponse<Demanda>> {
    return patchSecure<ApiResponse<Demanda>>(`/demandas/${id}/devolver`, data);
  },

  /**
   * Resolve uma demanda
   * PATCH /demandas/:id/resolver
   */
  async resolverDemanda(
    id: string,
    data: ResolverDemandaData
  ): Promise<ApiResponse<Demanda>> {
    return patchSecure<ApiResponse<Demanda>>(`/demandas/${id}/resolver`, data);
  },

  /**
   * Rejeita uma demanda (atualiza status e adiciona motivo)
   * PATCH /demandas/:id
   */
  async rejeitarDemanda(
    id: string,
    motivo: string
  ): Promise<ApiResponse<Demanda>> {
    return patchSecure<ApiResponse<Demanda>>(`/demandas/${id}/devolver`, {
      status: 'Recusada',
      motivo_devolucao: motivo
    });
  },

  /**
   * Deleta uma demanda
   */
  async deletarDemanda(id: string): Promise<ApiResponse<void>> {
    return delSecure<ApiResponse<void>>(`/demandas/${id}`);
  },

  /**
   * Faz upload de foto da demanda
   * 
   * @param id - ID da demanda
   * @param file - Arquivo de imagem
   */
  async uploadFotoDemanda(
    id: string,
    file: File
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    
    const formData = new FormData();
    formData.append('file', file);

    // Por enquanto, usa fetch direto com secureFetch para FormData
    // TODO: Atualizar /api/auth/secure-fetch para suportar FormData
    const response = await fetch('/api/auth/secure-fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/demandas/${id}/foto/demanda`,
        method: 'POST',
        // FormData precisa ser convertido para objeto
        bodyType: 'formData',
        formData: {
          file: await fileToBase64(file)
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da foto');
    }

    return response.json();
  },
};

/**
 * Helper para converter File para Base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
