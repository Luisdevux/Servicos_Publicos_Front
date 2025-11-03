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
    filters: Record<string, any> = {},
    limite: number = 10,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<TipoDemandaModel>>> {
    const params = new URLSearchParams();

    for (const key in filters) {
      const value = filters[key];
      if (value) {
        params.append(key, value);
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
   * Busca foto de um tipo de demanda
   * GET /tipoDemanda/:id/foto
   */
  async buscarFotoTipoDemanda(id: string): Promise<Blob> {
    const response = await fetch('/api/auth/secure-fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: `/tipoDemanda/${id}/foto`,
        method: 'GET'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao buscar foto: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  },

  async uploadFotoTipoDemanda(
    id: string,
    file: File
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    const response = await fetch('/api/auth/secure-fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/tipoDemanda/${id}/foto`,
        method: 'POST',
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


async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}