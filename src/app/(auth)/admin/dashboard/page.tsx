// src/app/(auth)/admin/dashboard/page.tsx

"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

  const metricas: DashboardMetrics = response?.data?.metricas || {
    totalDemandas: 0,
    novosColaboradores: 0,
    novosOperadores: 0,
    novasEmpresasTerceirizadas: 0
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
      title: "Novos Colaboradores",
      value: metricas.novosColaboradores.toLocaleString(),
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 3,
      title: "Novos Operadores",
      value: metricas.novosOperadores.toLocaleString(),
      icon: <IdCardLanyard className="h-6 w-6" />
    },
    {
      id: 4,
      title: "Novas Empresas Terceirizadas",
      value: metricas.novasEmpresasTerceirizadas.toLocaleString(),
      icon: <Building2 className="h-6 w-6" />
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 pt-3">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando métricas...</p>
          </div>
        </div>
      </div>
    );
  }

  // if (error) {
  //   const isTokenExpired = error instanceof ApiError && error.status === 498;
    
  //   return (
  //     <div className="space-y-6 pt-3">
  //       <div className="flex items-center justify-center py-12">
  //         <div className="text-center max-w-md mx-auto px-4">
  //           <FolderKanban className="h-16 w-16 text-red-400 mx-auto mb-4" />
  //           <p className="text-red-600 font-semibold mb-2">
  //             {isTokenExpired ? "Sessão expirada" : "Erro ao carregar métricas"}
  //           </p>
  //           <p className="text-gray-600 text-sm mb-4">
  //             {isTokenExpired 
  //               ? "Sua sessão expirou. Você será redirecionado para fazer login novamente..." 
  //               : (error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.")
  //             }
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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

