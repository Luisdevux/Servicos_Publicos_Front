// src/services/demandaService.ts

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
  async buscarDemandas(
    params?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Demanda>>> {
    // Construindo query string a partir dos parâmetros de paginação
    let endpoint = '/demandas';
    if (params) {
      const search = new URLSearchParams();
      if (params.page !== undefined) search.set('page', String(params.page));
      if (params.limit !== undefined) search.set('limit', String(params.limit));
      if (params.sort) search.set('sort', params.sort);
      if (params.select) search.set('select', params.select);
      if (params.status) {
        if (params.status.includes(',')) {
          const statuses = params.status.split(',');
          statuses.forEach(status => search.append('status', status.trim()));
        } else {
          search.set('status', params.status);
        }
      }
      const qs = search.toString();
      if (qs) endpoint += `?${qs}`;
    }

    return getSecure<ApiResponse<PaginatedResponse<Demanda>>>(endpoint);
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
   * Rejeita uma demanda (secretaria)
   * PATCH /demandas/:id/devolver com status 'Recusada'
   */
  async rejeitarDemanda(
    id: string,
    motivo: string
  ): Promise<ApiResponse<Demanda>> {
    return patchSecure<ApiResponse<Demanda>>(`/demandas/${id}/devolver`, {
      status: 'Recusada',
      motivo_rejeicao: motivo,
    });
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
   * Deleta uma demanda
   */
  async deletarDemanda(id: string): Promise<ApiResponse<void>> {
    return delSecure<ApiResponse<void>>(`/demandas/${id}`);
  },

  async uploadFoto(
    id: string,
    file: File,
    tipo: 'solicitacao' | 'resolucao'
  ): Promise<ApiResponse<{ link_imagem?: string; link_imagem_resolucao?: string }>> {
    const response = await fetch('/api/auth/secure-fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: `/demandas/${id}/foto/${tipo}`,
        method: 'POST',
        bodyType: 'formData',
        formData: {
          file: await fileToBase64(file),
          fileName: file.name
        }
      })
    });

    if (!response.ok) {
      let errorMessage = tipo === 'solicitacao' 
        ? 'Erro ao fazer upload da foto' 
        : 'Erro ao fazer upload da foto de resolução';
      
      try {
        const errorData = await response.json();
        console.error('[uploadFoto] Erro da API:', errorData);
        
        // Tenta extrair a mensagem de erro de diferentes formatos
        errorMessage = errorData.customMessage 
          || errorData.message 
          || errorData.error 
          || errorData.details 
          || errorMessage;
      } catch (e) {
        console.error('[uploadFoto] Não foi possível parsear erro:', e);
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async uploadFotoDemanda(
    id: string,
    file: File
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    return this.uploadFoto(id, file, 'solicitacao') as Promise<ApiResponse<{ link_imagem: string }>>;
  },

  async uploadFotoResolucao(
    id: string,
    file: File
  ): Promise<ApiResponse<{ link_imagem_resolucao: string }>> {
    return this.uploadFoto(id, file, 'resolucao') as Promise<ApiResponse<{ link_imagem_resolucao: string }>>;
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
