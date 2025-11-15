"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { demandaService } from "@/services/demandaService";
import type { Demanda as DemandaAPI } from "@/types";
import DetalhesDemandaModal from "@/components/detalheDemandaModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SecretariaPopulated {
  _id: string;
  nome: string;
  sigla: string;
  tipo: string;
}

interface UsuarioPopulated {
  _id: string;
  nome: string;
  email: string;
}

interface DemandaExtendida extends Omit<DemandaAPI, 'secretarias' | 'usuarios'> {
  secretarias?: SecretariaPopulated[] | string[];
  usuarios?: UsuarioPopulated[] | string[];
}

export default function DemandasAdminPage() {
  const [page, setPage] = useState(1);
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaExtendida | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroEndereco, setFiltroEndereco] = useState("");
  const [filtroSecretaria, setFiltroSecretaria] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["demandas-admin", page, filtroTipo, filtroStatus, filtroEndereco, filtroSecretaria, filtroData],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: "10",
      };

      if (filtroTipo && filtroTipo !== "todos") params.tipo = filtroTipo;
      if (filtroStatus && filtroStatus !== "todos") params.status = filtroStatus;
      if (filtroEndereco) params.endereco = filtroEndereco;
      if (filtroSecretaria) params.secretaria = filtroSecretaria;
      if (filtroData) params.data = filtroData;

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
    try {
      // Tenta criar data a partir de string no formato DD/MM/YYYY
      if (typeof data === 'string' && data.includes('/')) {
        const [dia, mes, ano] = data.split('/');
        return `${dia}/${mes}/${ano}`;
      }
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return data.toString();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Em aberto":
        return "bg-yellow-100 text-yellow-800";
      case "Em andamento":
        return "bg-blue-100 text-blue-800";
      case "Concluída":
        return "bg-green-100 text-green-800";
      case "Recusada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Filtro por tipo */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por tipo
              </label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Coleta">Coleta</SelectItem>
                  <SelectItem value="Iluminação">Iluminação</SelectItem>
                  <SelectItem value="Saneamento">Saneamento</SelectItem>
                  <SelectItem value="Árvores">Árvores</SelectItem>
                  <SelectItem value="Animais">Animais</SelectItem>
                  <SelectItem value="Pavimentação">Pavimentação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por status */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por status
              </label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Available values: Em aberto, Em andamento, Concluída, Recusada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Em aberto">Em aberto</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Recusada">Recusada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por bairro */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por bairro
              </label>
              <Input
                type="text"
                placeholder="bairro"
                value={filtroEndereco}
                onChange={(e) => setFiltroEndereco(e.target.value)}
              />
            </div>

            {/* Filtro por secretaria */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por secretaria
              </label>
              <Input
                type="text"
                placeholder="secretaria"
                value={filtroSecretaria}
                onChange={(e) => setFiltroSecretaria(e.target.value)}
              />
            </div>

            {/* Filtro por data */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por data
              </label>
              <Input
                type="text"
                placeholder="data"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIPO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SECRETARIA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BAIRRO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AÇÕES
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Carregando demandas...
                      </td>
                    </tr>
                  ) : demandas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma demanda encontrada.
                      </td>
                    </tr>
                  ) : (
                    demandas.map((demanda) => (
                      <tr key={demanda._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {demanda.tipo || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof demanda.secretarias?.[0] === 'object' ? demanda.secretarias[0].nome : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                              demanda.status
                            )}`}
                          >
                            {demanda.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {demanda.endereco?.bairro || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(demanda.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDemanda(demanda);
                                setOpenDetail(true);
                              }}
                              className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                              aria-label="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 hover:bg-red-50 rounded text-red-600"
                              aria-label="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevPage}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-700">
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
        </div>
      </div>

      {/* Modal de Detalhes */}
      {openDetail && selectedDemanda && (
        <DetalhesDemandaModal
          pedido={{
            id: selectedDemanda._id,
            titulo: `Demanda sobre ${selectedDemanda.tipo}`,
            status: selectedDemanda.status,
            descricao: selectedDemanda.descricao,
            link_imagem: selectedDemanda.link_imagem 
              ? (Array.isArray(selectedDemanda.link_imagem) 
                  ? selectedDemanda.link_imagem 
                  : [selectedDemanda.link_imagem])
              : undefined,
            link_imagem_resolucao: selectedDemanda.link_imagem_resolucao 
              ? (Array.isArray(selectedDemanda.link_imagem_resolucao) 
                  ? selectedDemanda.link_imagem_resolucao 
                  : [selectedDemanda.link_imagem_resolucao])
              : undefined,
            endereco: selectedDemanda.endereco ? {
              cep: selectedDemanda.endereco.cep || "",
              bairro: selectedDemanda.endereco.bairro || "",
              logradouro: selectedDemanda.endereco.logradouro || "",
              numero: String(selectedDemanda.endereco.numero) || "",
              complemento: selectedDemanda.endereco.complemento || "",
            } : undefined,
            progresso: {
              aprovado: true,
              emProgresso: selectedDemanda.status === "Em andamento" || selectedDemanda.status === "Concluída",
              concluido: selectedDemanda.status === "Concluída"
            },
            conclusao: selectedDemanda.status === "Concluída" && selectedDemanda.resolucao ? {
              descricao: selectedDemanda.resolucao,
              imagem: selectedDemanda.link_imagem_resolucao 
                ? (Array.isArray(selectedDemanda.link_imagem_resolucao) 
                    ? selectedDemanda.link_imagem_resolucao 
                    : [selectedDemanda.link_imagem_resolucao])
                : undefined,
              dataConclusao: selectedDemanda.updatedAt ? new Date(selectedDemanda.updatedAt).toLocaleDateString('pt-BR') : ""
            } : undefined,
            avaliacao: selectedDemanda.status === "Concluída" && selectedDemanda.feedback && selectedDemanda.avaliacao_resolucao ? {
              feedback: selectedDemanda.feedback,
              avaliacao_resolucao: selectedDemanda.avaliacao_resolucao
            } : undefined
          }}
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
