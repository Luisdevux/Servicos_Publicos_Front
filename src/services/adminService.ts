import { getSecure } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { Demanda } from '@/types/demanda';
import type { Usuarios } from '@/types/usuarios';
import type { Secretaria } from '@/types/secretaria';
import type {
  DashboardData,
  DashboardMetrics,
  DemandaPorBairro,
  DemandaPorCategoria,
} from '@/types/admin';

export const adminService = {
  async fetchAllPages<T>(endpoint: string): Promise<PaginatedResponse<T>> {
    let allDocs: T[] = [];
    let page = 1;
    let totalPages = 1;
    let totalDocs = 0;

    do {
      const response = await getSecure<ApiResponse<PaginatedResponse<T>>>(
        `${endpoint}?page=${page}`
      );

      const data = response.data;
      allDocs = [...allDocs, ...(data?.docs || [])];
      totalPages = data?.totalPages || 1;
      totalDocs = data?.totalDocs || allDocs.length;
      page++;
    } while (page <= totalPages);

    return {
      docs: allDocs,
      totalDocs,
      limit: allDocs.length,
      totalPages: 1,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
      pagingCounter: 1,
    };
  },

  async buscarMetricas(): Promise<ApiResponse<DashboardData>> {
    try {
      const [demandas, usuarios, secretarias] = await Promise.all([
        this.fetchAllPages<Demanda>('/demandas'),
        this.fetchAllPages<Usuarios>('/usuarios'),
        this.fetchAllPages<Secretaria>('/secretaria'),
      ]);

      const dashboardData = this.calcularMetricas(
        { message: 'Métricas calculadas com sucesso', data: demandas, errors: [] },
        usuarios.docs,
        secretarias.docs,
        secretarias.totalDocs
      );

      return {
        message: 'Métricas calculadas com sucesso',
        data: dashboardData,
        errors: [],
      };
    } catch (error) {
      console.error(`[ERROR] Falha ao buscar métricas:`, error);
      // Preserve the original error with status
      throw error;
    }
  },

  calcularMetricas(
    response: ApiResponse<PaginatedResponse<Demanda>>,
    usuarios: Usuarios[],
    secretarias: Secretaria[],
    totalSecretariasCount: number
  ): DashboardData {
    const demandas = response.data?.docs || [];
    const totalDemandas = response.data?.totalDocs || demandas.length;

    let totalColaboradores = 0;
    let totalOperadores = 0;

    usuarios.forEach((usuario) => {
      if (usuario.ativo === false) return;
      const nivel = usuario.nivel_acesso;
      if (nivel?.operador || nivel?.secretario || nivel?.administrador) totalColaboradores++;
      if (nivel?.operador) totalOperadores++;
    });

    const metricas: DashboardMetrics = {
      totalDemandas,
      novosColaboradores: totalColaboradores,
      novosOperadores: totalOperadores,
      secretarias: totalSecretariasCount,
    };

    return {
      metricas,
      demandasPorCategoria: this.calcularDemandasPorCategoria(demandas),
      demandasPorBairro: this.calcularDemandasPorBairro(demandas),
    };
  },

  calcularDemandasPorCategoria(demandas: Demanda[]): DemandaPorCategoria[] {
    const categorias: Record<string, number> = {};

    demandas.forEach((demanda) => {
      const tipo = demanda.tipo || 'Outros';
      categorias[tipo] = (categorias[tipo] || 0) + 1;
    });

    const cores = {
      Iluminação: '#f59e0b',
      Pavimentação: '#ef4444',
      Saneamento: '#10b981',
      'Coleta de Lixo': '#8b5cf6',
      Arborização: '#06b6d4',
      Coleta: '#8b5cf6',
      Árvores: '#06b6d4',
      Animais: '#f97316',
      Outros: '#6b7280',
    };

    return Object.entries(categorias).map(([categoria, quantidade]) => ({
      categoria,
      quantidade,
      cor: cores[categoria as keyof typeof cores] || '#6b7280',
    }));
  },

  calcularDemandasPorBairro(demandas: Demanda[]): DemandaPorBairro[] {
    const bairros: Record<string, number> = {};

    demandas.forEach((demanda) => {
      const bairro = demanda.endereco?.bairro || 'Não informado';
      bairros[bairro] = (bairros[bairro] || 0) + 1;
    });

    const cores = ['#8b5cf6', '#94E9B8', '#3b82f6', '#9F9FF8', '#10b981'];

    return Object.entries(bairros)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([bairro, quantidade], index) => ({
        bairro,
        quantidade,
        cor: cores[index % cores.length],
      }));
  },
};
