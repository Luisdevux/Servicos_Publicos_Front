"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { demandaService } from "@/services/demandaService";
import type { Demanda as DemandaAPI } from "@/types";
import DetalhesDemandaModal from "@/components/detalheDemandaModal";

interface TipoDemandaPopulated {
  _id: string;
  titulo: string;
  descricao: string;
  tipo: string;
}

interface SecretariaPopulated {
  _id: string;
  nome: string;
  sigla: string;
}

interface DemandaExtendida extends DemandaAPI {
  tipo_demanda?: TipoDemandaPopulated;
  secretaria?: SecretariaPopulated;
  protocolo?: string;
  titulo?: string;
}

export default function DemandasAdminPage() {
  const [page, setPage] = useState(1);
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaExtendida | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["demandas-admin", page],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: "12",
      };

      const response = await demandaService.buscarDemandas(params as any);
      return response;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const totalPages = data?.data?.totalPages ?? 1;
  const hasNextPage = data?.data?.hasNextPage ?? false;
  const hasPrevPage = data?.data?.hasPrevPage ?? false;
  const demandas: DemandaExtendida[] = data?.data?.docs ?? [];

  const formatarData = (data: string | Date | undefined) => {
    if (!data) return "N/A";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Em aberto":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Em andamento":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Concluída":
        return "bg-green-100 text-green-800 border-green-300";
      case "Recusada":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-global-bg">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">

          {/* Tabela */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Secretaria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Carregando demandas...
                      </td>
                    </tr>
                  ) : demandas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma demanda encontrada.
                      </td>
                    </tr>
                  ) : (
                    demandas.map((demanda) => (
                      <tr key={demanda._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {demanda.titulo || `Demanda sobre ${demanda.tipo}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {demanda.tipo_demanda?.titulo || demanda.tipo || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {demanda.secretaria?.sigla || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
                              demanda.status
                            )}`}
                          >
                            {demanda.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(demanda.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDemanda(demanda as any);
                              setOpenDetail(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label={`Ver detalhes de ${demanda.titulo || demanda.tipo}`}
                          >
                            <Eye className="h-4 w-4 text-global-text-primary" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-center gap-4 p-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!hasPrevPage}
          className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm text-global-text-primary">
          <span>
            Página {Math.min(page, totalPages)} de {totalPages}
          </span>
        </div>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage}
          className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Modal de Detalhes */}
      {openDetail && selectedDemanda && (
        <DetalhesDemandaModal
          pedido={selectedDemanda as any}
          isOpen={openDetail}
          onClose={() => {
            setOpenDetail(false);
            setSelectedDemanda(null);
          }}
        />
      )}
    </div>
  );
}
