// src/services/tipoDemandaService.ts

import { getSecure, postSecure, patchSecure, delSecure } from './api';
import type {
  TipoDemandaModel,
  ApiResponse,
  PaginatedResponse,
  CreateTipoDemandaData,
  UpdateTipoDemandaData,
} from '@/types';

/**
 * Service para gerenciar tipos de demanda
 */
export const tipoDemandaService = {
  /**
   * Busca todos os tipos de demanda
   */
  async buscarTiposDemanda(): Promise<ApiResponse<PaginatedResponse<TipoDemandaModel>>> {
    return getSecure<ApiResponse<PaginatedResponse<TipoDemandaModel>>>('/tipoDemanda');
  },

  /**
   * Busca tipos de demanda filtrados por tipo com limite customizado
   */
  async buscarTiposDemandaPorTipo(
    filters: Record<string, unknown> = {},
    limite: number = 10,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<TipoDemandaModel>>> {
    const params = new URLSearchParams();

    for (const key in filters) {
      const value = filters[key];
      if (value) {
        params.append(key, String(value));
      }
    }
    params.append('limite', String(limite));
    params.append('page', String(page));

    return getSecure<ApiResponse<PaginatedResponse<TipoDemandaModel>>>(
      `/tipoDemanda?${params.toString()}`
    );
  },

  /**
   * Busca um tipo de demanda por ID
   */
  async buscarTipoDemandaPorId(id: string): Promise<ApiResponse<TipoDemandaModel>> {
    return getSecure<ApiResponse<TipoDemandaModel>>(`/tipoDemanda/${id}`);
  },

  /**
   * Cria um novo tipo de demanda
   */
  async criarTipoDemanda(data: CreateTipoDemandaData): Promise<ApiResponse<TipoDemandaModel>> {
    return postSecure<ApiResponse<TipoDemandaModel>>('/tipoDemanda', data);
  },

  /**
   * Atualiza um tipo de demanda
   */
  async atualizarTipoDemanda(
    id: string,
    data: UpdateTipoDemandaData
  ): Promise<ApiResponse<TipoDemandaModel>> {
    return patchSecure<ApiResponse<TipoDemandaModel>>(`/tipoDemanda/${id}`, data);
  },

  /**
   * Deleta um tipo de demanda
   */
  async deletarTipoDemanda(id: string): Promise<ApiResponse<void>> {
    return delSecure<ApiResponse<void>>(`/tipoDemanda/${id}`);
  },

  /**
   * Faz upload de foto do tipo de demanda
   * POST /tipoDemanda/:id/foto
   */
  async uploadFotoTipoDemanda(
    id: string,
    file: File,
    token: string
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tipoDemanda/${id}/foto`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da foto');
    }

    return response.json();
  },

  /**
   * Deleta uma foto de tipo de demanda
   *  DELETE /tipoDemanda/:id/foto
   */
  async deletarFotoTipoDemanda(id: string): Promise<ApiResponse<void>> {
    return delSecure<ApiResponse<void>>(`/tipoDemanda/${id}/foto`);
  }

  
};