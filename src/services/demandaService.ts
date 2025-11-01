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

  /**
   * Faz upload de foto da demanda
   */
  async uploadFotoDemanda(
    id: string,
    file: File,
    tipo: 'solicitacao' | 'resolucao'
  ): Promise<ApiResponse<{ link_imagem: string, tipo: string }>> {
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Iniciando upload de imagem:', {
        demandaId: id,
        tipo,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type
      });

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
            file: await fileToBase64(file)
          }
        }),
        // Aumenta timeout para uploads grandes
        signal: AbortSignal.timeout(60000), // 60 segundos
      });

      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || 'Erro ao fazer upload da foto';
        console.error('Erro no upload:', errorData);
        throw new Error(`Upload falhou (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      
      console.log('Resposta completa do servidor:', result);
      
      // Validar se o resultado contém o link da imagem
      // A API pode retornar em diferentes formatos, vamos aceitar todos
      const linkImagem = result.data?.link_imagem || result.link_imagem || result.data?.url || result.url;
      
      if (!linkImagem) {
        console.error('Resposta do servidor sem link da imagem:', result);
        throw new Error('Resposta do servidor não contém o link da imagem');
      }

      console.log('Link da imagem recebido:', linkImagem);

      // Normaliza a resposta para o formato esperado
      return {
        ...result,
        data: {
          link_imagem: linkImagem,
          tipo: result.data?.tipo || tipo
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao fazer upload da foto');
    }
  },

  /**
   * Faz upload de foto da resolução da demanda
   */
  async uploadFotoResolucao(
    id: string,
    file: File
  ): Promise<ApiResponse<{ link_imagem_resolucao: string }>> {
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/auth/secure-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/demandas/${id}/foto/resolucao`,
          method: 'POST',
          bodyType: 'formData',
          formData: {
            file: await fileToBase64(file)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || 'Erro ao fazer upload da foto de resolução';
        throw new Error(`Upload falhou (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      
      // Validar se o resultado contém o link da imagem
      // A API pode retornar em diferentes formatos, vamos aceitar todos
      const linkImagem = result.data?.link_imagem_resolucao || 
                         result.link_imagem_resolucao || 
                         result.data?.link_imagem || 
                         result.link_imagem ||
                         result.data?.url || 
                         result.url;
      
      if (!linkImagem) {
        console.error('Resposta do servidor sem link da imagem de resolução:', result);
        throw new Error('Resposta do servidor não contém o link da imagem de resolução');
      }

      console.log('Link da imagem de resolução recebido:', linkImagem);

      // Normaliza a resposta para o formato esperado
      return {
        ...result,
        data: {
          link_imagem_resolucao: linkImagem
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao fazer upload da foto de resolução');
    }
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
