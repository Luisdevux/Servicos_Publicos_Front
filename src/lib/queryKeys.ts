// src/lib/queryKeys.ts

/* Query Keys tipadas para TanStack Query */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  demandas: {
    all: ['demandas'] as const,
    lists: () => [...queryKeys.demandas.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.demandas.lists(), filters] as const,
    details: () => [...queryKeys.demandas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.demandas.details(), id] as const,
  },
  usuarios: {
    all: ['usuarios'] as const,
    lists: () => [...queryKeys.usuarios.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.usuarios.lists(), filters] as const,
    details: () => [...queryKeys.usuarios.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.usuarios.details(), id] as const,
  },
  secretarias: {
    all: ['secretarias'] as const,
    lists: () => [...queryKeys.secretarias.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.secretarias.lists(), filters] as const,
    details: () => [...queryKeys.secretarias.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.secretarias.details(), id] as const,
  },
  tipoDemandas: {
    all: ['tipoDemandas'] as const,
    lists: () => [...queryKeys.tipoDemandas.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.tipoDemandas.lists(), filters] as const,
    details: () => [...queryKeys.tipoDemandas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tipoDemandas.details(), id] as const,
  },
} as const;
