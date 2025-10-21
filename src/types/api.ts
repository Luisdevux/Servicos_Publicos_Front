// src/types/api.ts

/**
 * Estrutura padrão de resposta da API
 */
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  errors: Array<{ message: string }>;
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  pagingCounter: number;
}

/**
 * Estrutura de erro da API
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Array<{ message: string }>;
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
}

/**
 * Parâmetros de busca genéricos
 */
export interface SearchParams {
  q?: string;
  [key: string]: unknown;
}
