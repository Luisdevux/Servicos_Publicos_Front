// src/services/usuarioService.ts

import { get, post, patch, del } from './api';
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
  async buscarUsuarios(
    token: string
  ): Promise<ApiResponse<PaginatedResponse<Usuarios>>> {
    return get<ApiResponse<PaginatedResponse<Usuarios>>>('/usuarios', token);
  },

  /**
   * Busca um usuário por ID
   * GET /usuarios/:id (requer AuthMiddleware + AuthPermission)
   */
  async buscarUsuarioPorId(
    id: string,
    token: string
  ): Promise<ApiResponse<Usuarios>> {
    return get<ApiResponse<Usuarios>>(`/usuarios/${id}`, token);
  },

  /**
   * Cria um novo usuário (admin criando usuário)
   * POST /usuarios (requer AuthMiddleware + AuthPermission)
   */
  async criarUsuario(
    data: CreateUsuariosData,
    token: string
  ): Promise<ApiResponse<Usuarios>> {
    return post<ApiResponse<Usuarios>>('/usuarios', data, token);
  },

  /**
   * Atualiza um usuário
   * PATCH /usuarios/:id (requer AuthMiddleware + AuthPermission)
   */
  async atualizarUsuario(
    id: string,
    data: UpdateUsuariosData,
    token: string
  ): Promise<ApiResponse<Usuarios>> {
    return patch<ApiResponse<Usuarios>>(`/usuarios/${id}`, data, token);
  },

  /**
   * Deleta um usuário
   * DELETE /usuarios/:id (requer AuthMiddleware + AuthPermission)
   */
  async deletarUsuario(id: string, token: string): Promise<ApiResponse<void>> {
    return del<ApiResponse<void>>(`/usuarios/${id}`, token);
  },

  /**
   * Faz upload de foto do usuário
   * POST /usuarios/:id/foto (requer AuthMiddleware + AuthPermission)
   */
  async uploadFotoUsuario(
    id: string,
    file: File,
    token: string
  ): Promise<ApiResponse<{ link_imagem: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}/foto`,
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
   * Busca foto de um usuário
   * GET /usuarios/:id/foto (requer AuthMiddleware + AuthPermission)
   */
  async buscarFotoUsuario(id: string, token: string): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}/foto`,
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
};
