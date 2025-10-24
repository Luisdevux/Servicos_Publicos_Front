// src/services/demandaService.ts

import { get, post, patch, del } from './api';
import type {
  Demanda,
  TipoDemandaModel,
  ApiResponse,
  PaginatedResponse,
  CreateDemandaData,
  UpdateDemandaData,
  AtribuirDemandaData,
  DevolverDemandaData,
  ResolverDemandaData,
  PaginationParams,
} from '@/types';

/**
 * Service para gerenciar demandas
 * Rotas da API: /demandas, /demandas/:id, /demandas/:id/atribuir, etc.
 */
export const demandaService = {
  /**
   * Busca todas as demandas
   */
  async buscarDemandas(token: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Demanda>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }
    if (params?.select) {
      queryParams.append('select', params.select);
    }
    
    const url = queryParams.toString() ? `/demandas?${queryParams.toString()}` : '/demandas';
    return get<ApiResponse<PaginatedResponse<Demanda>>>(url, token);
  },

  /**
   * Busca uma demanda por ID
   */
  async buscarDemandaPorId(id: string, token: string): Promise<ApiResponse<Demanda>> {
    return get<ApiResponse<Demanda>>(`/demandas/${id}`, token);
  },

  /**
   * Cria uma nova demanda
   */
  async criarDemanda(
    data: CreateDemandaData,
    token: string
  ): Promise<ApiResponse<Demanda>> {
    return post<ApiResponse<Demanda>>('/demandas', data, token);
  },

  /**
   * Atualiza uma demanda
   */
  async atualizarDemanda(
    id: string,
    data: UpdateDemandaData,
    token: string
  ): Promise<ApiResponse<Demanda>> {
    return patch<ApiResponse<Demanda>>(`/demandas/${id}`, data, token);
  },

  /**
   * Atribui demanda a usuários
   * PATCH /demandas/:id/atribuir
   */
  async atribuirDemanda(
    id: string,
    data: AtribuirDemandaData,
    token: string
  ): Promise<ApiResponse<Demanda>> {
    return patch<ApiResponse<Demanda>>(`/demandas/${id}/atribuir`, data, token);
  },

  /**
   * Devolve uma demanda
   * PATCH /demandas/:id/devolver
   */
  async devolverDemanda(
    id: string,
    data: DevolverDemandaData,
    token: string
  ): Promise<ApiResponse<Demanda>> {
    return patch<ApiResponse<Demanda>>(`/demandas/${id}/devolver`, data, token);
  },

  /**
   * Resolve uma demanda
   * PATCH /demandas/:id/resolver
   */
  async resolverDemanda(
    id: string,
    data: ResolverDemandaData,
    token: string
  ): Promise<ApiResponse<Demanda>> {
    return patch<ApiResponse<Demanda>>(`/demandas/${id}/resolver`, data, token);
  },

  /**
   * Deleta uma demanda
   */
  async deletarDemanda(id: string, token: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`/demandas/${id}`, token);
  },

  /**
   * Faz upload de foto da demanda
   */
  async uploadFotoDemanda(
    id: string,
    file: File,
    token: string
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/demandas/${id}/foto/demanda`,
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
