// src/services/secretariaService.ts

import { getSecure, postSecure } from './api';
import type { ApiResponse, CreateSecretariaData, PaginatedResponse, Secretaria } from '@/types';

export const secretariaService = {
  async buscarSecretarias(
    filters: Record<string, any> = {},
    limit: number = 10,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<Secretaria>>> {
    const params = new URLSearchParams();

    for (const key in filters) {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    }
    params.append('limite', String(limit));
    params.append('page', String(page));

    return getSecure<ApiResponse<PaginatedResponse<Secretaria>>>(
      `/secretaria?${params.toString()}`
    );
  },
  async criarSecretaria(data: CreateSecretariaData): Promise<ApiResponse<Secretaria>> {
    return postSecure<ApiResponse<Secretaria>>('/secretaria', data);
  },
};


