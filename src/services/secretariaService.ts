// src/services/secretariaService.ts

import { postSecure } from './api';
import type { ApiResponse, CreateSecretariaData, Secretaria } from '@/types';

export const secretariaService = {
  async criarSecretaria(data: CreateSecretariaData): Promise<ApiResponse<Secretaria>> {
    return postSecure<ApiResponse<Secretaria>>('/secretaria', data);
  },
};


