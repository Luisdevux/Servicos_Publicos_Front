// src/services/grupoService.ts

import { getSecure } from './api';
import type { ApiResponse, Grupo, PaginatedResponse } from '@/types';

export const grupoService = {
  async buscarGrupos(
    filters: Record<string, unknown> = {},
    limit: number = 100,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<Grupo>>> {
    const params = new URLSearchParams();

    for (const key in filters) {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    }
    params.append('limite', String(limit));
    params.append('page', String(page));

    return getSecure<ApiResponse<PaginatedResponse<Grupo>>>(
      `/grupos?${params.toString()}`
    );
  },
};
