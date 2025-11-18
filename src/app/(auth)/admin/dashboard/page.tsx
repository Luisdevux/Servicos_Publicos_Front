// src/app/(auth)/admin/dashboard/page.tsx

"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { DonutChartCard } from "@/components/DonutChartCard";
import { 
  FolderKanban, 
  Users, 
  IdCardLanyard, 
  Building2 
} from "lucide-react";
import { adminService } from "@/services/adminService";
import type { DashboardMetrics, DemandaPorBairro, DemandaPorCategoria } from "@/types/admin";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      try {
        const result = await adminService.buscarMetricas();
        return result;
      } catch (err) {
        console.error("Erro ao buscar métricas:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as { status?: number })?.status;
      
      if (
        errorStatus === 498 ||
        errorMessage.includes('expirado')
      ) {
        toast.error('Sua sessão expirou. Você será redirecionado para fazer login novamente...');
        signOut({ redirect: false }).then(() => {
          window.location.href = '/login/funcionario';
        });
      }
    }
  }, [error]);

  const metricas: DashboardMetrics = response?.data?.metricas || {
    totalDemandas: 0,
    novosColaboradores: 0,
    novosOperadores: 0,
    secretarias: 0
  };

  const dadosDemandasPorBairro: DemandaPorBairro[] = response?.data?.demandasPorBairro || [];
  const dadosDemandasPorCategoria: DemandaPorCategoria[] = response?.data?.demandasPorCategoria || [];

  const metricasCards = [
    {
      id: 1,
      title: "Demandas",
      value: metricas.totalDemandas.toLocaleString(),
      icon: <FolderKanban className="h-6 w-6" />
    },
    {
      id: 2,
      title: "Colaboradores ativos",
      value: metricas.novosColaboradores.toLocaleString(),
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 3,
      title: "Operadores ativos",
      value: metricas.novosOperadores.toLocaleString(),
      icon: <IdCardLanyard className="h-6 w-6" />
    },
    {
      id: 4,
      title: "Secretarias",
      value: metricas.secretarias.toLocaleString(),
      icon: <Building2 className="h-6 w-6" />
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 pt-3">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-global-accent border-t-transparent mx-auto"></div>
            <p className="text-gray-600">Carregando métricas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {metricasCards.map((metrica) => (
          <MetricCard 
            key={metrica.id} 
            title={metrica.title} 
            value={metrica.value} 
            icon={metrica.icon} 
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Os 5 Bairros com Maior Quantidade de Demandas Solicitadas"
          data={dadosDemandasPorBairro}
          colors={dadosDemandasPorBairro.map((item) => item.cor)}
        />
        <DonutChartCard 
          title="Demandas Por Categoria"
          data={dadosDemandasPorCategoria}
        />
      </div>
    </div>
  );
}

