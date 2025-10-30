// src/services/usuarioService.ts

import { getSecure, postSecure, patchSecure, delSecure } from './api';
import type {
  Usuarios,
  ApiResponse,
  PaginatedResponse,
  CreateUsuariosData,
  UpdateUsuariosData,
} from '@/types';

/**
 * Service para gerenciar usuários
 * Rotas da API: GET/POST/PATCH/DELETE /usuarios, /usuarios/:id
 * Rotas de foto: POST/GET /usuarios/:id/foto
 */
export const usuarioService = {
  /**
   * Busca todos os usuários
   * GET /usuarios (requer AuthMiddleware + AuthPermission)
   */
  async buscarUsuarios(): Promise<ApiResponse<PaginatedResponse<Usuarios>>> {
    return getSecure<ApiResponse<PaginatedResponse<Usuarios>>>('/usuarios');
  },


  async buscarUsuariosPaginado(filters: Record<string, any> = {}, limit: number = 10, page: number = 1): Promise<ApiResponse<PaginatedResponse<Usuarios>>> {
    const params = new URLSearchParams();
    for (const key in filters) {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    }
    params.append('limite', String(limit));
    params.append('page', String(page));

    return getSecure<ApiResponse<PaginatedResponse<Usuarios>>>(`/usuarios?${params.toString()}`);
  },

  /**
   * Busca um usuário por ID
   * GET /usuarios/:id (requer AuthMiddleware + AuthPermission)
   */
  async buscarUsuarioPorId(id: string): Promise<ApiResponse<Usuarios>> {
    return getSecure<ApiResponse<Usuarios>>(`/usuarios/${id}`);
  },

  /**
   * Cria um novo usuário (admin criando usuário)
   * POST /usuarios (requer AuthMiddleware + AuthPermission)
   */
  async criarUsuario(data: CreateUsuariosData): Promise<ApiResponse<Usuarios>> {
    return postSecure<ApiResponse<Usuarios>>('/usuarios', data);
  },

  /**
   * Atualiza um usuário
   * PATCH /usuarios/:id (requer AuthMiddleware + AuthPermission)
   */
  async atualizarUsuario(
    id: string,
    data: UpdateUsuariosData
  ): Promise<ApiResponse<Usuarios>> {
    return patchSecure<ApiResponse<Usuarios>>(`/usuarios/${id}`, data);
  },

  /**
   * Deleta um usuário
   * DELETE /usuarios/:id (requer AuthMiddleware + AuthPermission)
   */
  async deletarUsuario(id: string): Promise<ApiResponse<void>> {
    return delSecure<ApiResponse<void>>(`/usuarios/${id}`);
  },

  /**
   * Faz upload de foto do usuário
   * POST /usuarios/:id/foto (requer AuthMiddleware + AuthPermission)
   */
  async uploadFotoUsuario(
    id: string,
    file: File
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/auth/secure-fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: `/usuarios/${id}/foto`,
        method: 'POST',
        body: formData
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload da foto');
    }

    return response.json();
  },

  /**
   * Busca foto de um usuário
   * GET /usuarios/:id/foto (requer AuthMiddleware + AuthPermission)
   */
  async buscarFotoUsuario(id: string): Promise<Blob> {
    const response = await fetch('/api/auth/secure-fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: `/usuarios/${id}/foto`,
        method: 'GET'
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar foto');
    }

    return response.blob();
  },

  /**
   * Busca usuários do tipo operador
   * GET /usuarios?nivel_acesso=operador
   */
  async buscarOperadores(
    token: string
  ): Promise<ApiResponse<PaginatedResponse<Usuarios>>> {
    return getSecure<ApiResponse<PaginatedResponse<Usuarios>>>('/usuarios?nivel_acesso=operador');
  },
};
