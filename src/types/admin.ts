export interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    className?: string;
  }

export interface DashboardMetrics {
  totalDemandas: number;
  novosColaboradores: number;
  novosOperadores: number;
  novasEmpresasTerceirizadas: number;
}

export interface DemandaPorBairro {
  bairro: string;
  quantidade: number;
  cor: string;
}

export interface DemandaPorCategoria {
  categoria: string;
  quantidade: number;
  cor: string;
}

export interface DashboardData {
  metricas: DashboardMetrics;
  demandasPorBairro: DemandaPorBairro[];
  demandasPorCategoria: DemandaPorCategoria[];
}
