// src/services/tipoDemandaService.ts

import { get, post, patch, del } from './api';
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
  async buscarTiposDemanda(
    token: string
  ): Promise<ApiResponse<PaginatedResponse<TipoDemandaModel>>> {
    return get<ApiResponse<PaginatedResponse<TipoDemandaModel>>>(
      '/tipoDemanda',
      token
    );
  },

  /**
   * Busca tipos de demanda filtrados por tipo com limite customizado
   */
  async buscarTiposDemandaPorTipo(
    token: string,
    tipo: string,
    limite: number = 100
  ): Promise<ApiResponse<PaginatedResponse<TipoDemandaModel>>> {
    return get<ApiResponse<PaginatedResponse<TipoDemandaModel>>>(
      `/tipoDemanda?tipo=${encodeURIComponent(tipo)}&limite=${limite}`,
      token
    );
  },

  /**
   * Busca um tipo de demanda por ID
   */
  async buscarTipoDemandaPorId(
    id: string,
    token: string
  ): Promise<ApiResponse<TipoDemandaModel>> {
    return get<ApiResponse<TipoDemandaModel>>(`/tipoDemanda/${id}`, token);
  },

  /**
   * Cria um novo tipo de demanda
   */
  async criarTipoDemanda(
    data: CreateTipoDemandaData,
    token: string
  ): Promise<ApiResponse<TipoDemandaModel>> {
    return post<ApiResponse<TipoDemandaModel>>('/tipoDemanda', data, token);
  },

  /**
   * Atualiza um tipo de demanda
   */
  async atualizarTipoDemanda(
    id: string,
    data: UpdateTipoDemandaData,
    token: string
  ): Promise<ApiResponse<TipoDemandaModel>> {
    return patch<ApiResponse<TipoDemandaModel>>(`/tipoDemanda/${id}`, data, token);
  },

  /**
   * Deleta um tipo de demanda
   */
  async deletarTipoDemanda(
    id: string,
    token: string
  ): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`/tipoDemanda/${id}`, token);
  },

  /**
   * Busca foto de um tipo de demanda
   * GET /tipoDemanda/:id/foto
   */
  async buscarFotoTipoDemanda(id: string, token: string): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tipoDemanda/${id}/foto`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar foto');
    }

    return response.blob();
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
};