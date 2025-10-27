import { get } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { Demanda } from '@/types/demanda';
import type {
  DashboardData,
  DashboardMetrics,
  DemandaPorBairro,
  DemandaPorCategoria,
} from '@/types/admin';

export const adminService = {
  async buscarMetricas(): Promise<ApiResponse<DashboardData>> {
    let allDemandas: Demanda[] = [];
    let page = 1;
    let totalPages = 1;

    try {
      while (page <= totalPages) {
        const response = await get<ApiResponse<PaginatedResponse<Demanda>>>(
          `/demandas?page=${page}`
        );

        allDemandas = [...allDemandas, ...(response.data?.docs || [])];
        totalPages = response.data?.totalPages || 1;
        page++;
      }

       const dashboardData = this.calcularMetricas({
         message: 'Métricas calculadas com sucesso',
         data: {
           docs: allDemandas,
           totalDocs: allDemandas.length,
           limit: allDemandas.length,
           totalPages: 1,
           page: 1,
           hasNextPage: false,
           hasPrevPage: false,
           nextPage: null,
           prevPage: null,
           pagingCounter: 1,
         },
         errors: [],
       });

       return {
         message: 'Métricas calculadas com sucesso',
         data: dashboardData,
         errors: [],
       };
    } catch (error) {
      console.error(`[ERROR] Falha ao buscar demandas:`, error);
      throw new Error('Erro ao buscar demandas');
    }
  },

  calcularMetricas(response: ApiResponse<PaginatedResponse<Demanda>>): DashboardData {
    const demandas = response.data?.docs || [];
    const totalDemandas = response.data?.totalDocs || demandas.length;

    const metricas: DashboardMetrics = {
      totalDemandas,
      novosColaboradores: 0, // TODO: implementar quando tivermos endpoint
      novosOperadores: 0, // TODO: implementar quando tivermos endpoint
      novasEmpresasTerceirizadas: 0, // TODO: implementar quando tivermos endpoint
    };

    const demandasPorCategoria = this.calcularDemandasPorCategoria(demandas);
    const demandasPorBairro = this.calcularDemandasPorBairro(demandas);

    return {
      metricas,
      demandasPorBairro,
      demandasPorCategoria,
    };
  },

  calcularDemandasPorCategoria(demandas: Demanda[]): DemandaPorCategoria[] {
    const categorias: { [key: string]: number } = {};

    demandas.forEach((demanda, index) => {
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
    const bairros: { [key: string]: number } = {};

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