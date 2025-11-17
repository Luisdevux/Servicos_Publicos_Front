"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Eye, RotateCcw, Trash2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { demandaService } from "@/services/demandaService";
import type { Demanda as DemandaAPI } from "@/types";
import DetalhesDemandaModal from "@/components/detalheDemandaModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  
  // Modais de ações
  const [openDevolverModal, setOpenDevolverModal] = useState(false);
  const [demandaParaDevolver, setDemandaParaDevolver] = useState<DemandaExtendida | null>(null);
  const [motivoDevolucao, setMotivoDevolucao] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [demandaParaDeletar, setDemandaParaDeletar] = useState<DemandaExtendida | null>(null);
  
  // Filtros com debounce para busca
  const [pendingSearchText, setPendingSearchText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["demandas-admin"],
    queryFn: async () => {
      // Buscar todas as demandas (sem paginação no backend)
      let allDocs: DemandaExtendida[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await demandaService.buscarDemandas({ page: String(page), limit: "100" } as any);
        const payload = response.data;
        if (payload?.docs?.length) {
          allDocs = allDocs.concat(payload.docs);
        }
        totalPages = payload?.totalPages || 1;
        page++;
      } while (page <= totalPages);

      return allDocs;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const demandas: DemandaExtendida[] = Array.isArray(data) ? data : [];

  // Mutation para devolver demanda
  const devolverMutation = useMutation({
    mutationFn: ({ demandaId, motivo }: { demandaId: string; motivo: string }) => {
      return demandaService.rejeitarDemanda(demandaId, motivo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandas-admin"] });
      toast.success("Demanda devolvida com sucesso!");
      setOpenDevolverModal(false);
      setDemandaParaDevolver(null);
      setMotivoDevolucao("");
    },
    onError: (error) => {
      console.error("Erro ao devolver demanda:", error);
      toast.error("Erro ao devolver demanda. Tente novamente.");
    },
  });

  // Mutation para deletar demanda
  const deletarMutation = useMutation({
    mutationFn: (demandaId: string) => {
      return demandaService.deletarDemanda(demandaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandas-admin"] });
      toast.success("Demanda excluída com sucesso!");
      setOpenDeleteModal(false);
      setDemandaParaDeletar(null);
    },
    onError: (error) => {
      console.error("Erro ao deletar demanda:", error);
      toast.error("Erro ao deletar demanda. Tente novamente.");
    },
  });

  // Handlers
  const handleDevolver = () => {
    if (demandaParaDevolver && motivoDevolucao.trim()) {
      devolverMutation.mutate({
        demandaId: demandaParaDevolver._id,
        motivo: motivoDevolucao.trim(),
      });
    }
  };

  const handleDeletar = async () => {
    if (demandaParaDeletar) {
      deletarMutation.mutate(demandaParaDeletar._id);
    }
  };

  // Debounce para a busca
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchText(pendingSearchText);
    }, 300);
    return () => clearTimeout(id);
  }, [pendingSearchText]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [searchText, filtroTipo, filtroStatus]);

  // Filtrar demandas
  const demandasFiltradas = useMemo(() => {
    const termo = searchText.trim().toLowerCase();
    return demandas.filter((demanda) => {
      // Filtro por texto (bairro, secretaria)
      const byTexto = termo
        ? (demanda.tipo?.toLowerCase().includes(termo) ||
           demanda.endereco?.bairro?.toLowerCase().includes(termo) ||
           (typeof demanda.secretarias?.[0] === 'object' 
             ? demanda.secretarias[0].nome?.toLowerCase().includes(termo)
             : false))
        : true;

      // Filtro por tipo
      const byTipo = filtroTipo === 'todos'
        ? true
        : demanda.tipo === filtroTipo;

      // Filtro por status
      const byStatus = filtroStatus === 'todos'
        ? true
        : demanda.status === filtroStatus;

      return byTexto && byTipo && byStatus;
    });
  }, [demandas, searchText, filtroTipo, filtroStatus]);

  // Paginação local
  const ITENS_POR_PAGINA = 10;
  const totalPaginas = Math.max(1, Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA));
  const indiceInicial = (page - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const demandasPaginadas = demandasFiltradas.slice(indiceInicial, indiceFinal);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPaginas;

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
    <div className="min-h-screen bg-global-bg">
      <div className="px-6 sm:px-6 py-6 md:py-8">
        <div className="mx-auto space-y-6">
          
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="relative flex gap-3 items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por bairro ou secretaria"
                  value={pendingSearchText}
                  onChange={(e) => setPendingSearchText(e.target.value)}
                  className="w-72 pl-9"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="Coleta">Coleta</SelectItem>
                  <SelectItem value="Iluminação">Iluminação</SelectItem>
                  <SelectItem value="Saneamento">Saneamento</SelectItem>
                  <SelectItem value="Árvores">Árvores</SelectItem>
                  <SelectItem value="Animais">Animais</SelectItem>
                  <SelectItem value="Pavimentação">Pavimentação</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="Em aberto">Em aberto</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Recusada">Recusada</SelectItem>
                </SelectContent>
              </Select>
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
                  ) : demandasPaginadas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma demanda encontrada.
                      </td>
                    </tr>
                  ) : (
                    demandasPaginadas.map((demanda, index) => (
                      <tr key={`${demanda._id}-${index}`} className="hover:bg-gray-50">
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
                              onClick={() => {
                                setDemandaParaDeletar(demanda);
                                setOpenDeleteModal(true);
                              }}
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
                Página {Math.min(page, totalPaginas)} de {totalPaginas}
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

      {/* Modal de Devolução */}
      <Dialog open={openDevolverModal} onOpenChange={setOpenDevolverModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Devolver Demanda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Você está prestes a devolver a demanda sobre <strong>{demandaParaDevolver?.tipo}</strong>.
              Por favor, informe o motivo da devolução:
            </p>
            <Textarea
              placeholder="Digite o motivo da devolução..."
              value={motivoDevolucao}
              onChange={(e) => setMotivoDevolucao(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpenDevolverModal(false);
                setDemandaParaDevolver(null);
                setMotivoDevolucao("");
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDevolver}
              disabled={!motivoDevolucao.trim() || devolverMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {devolverMutation.isPending ? "Devolvendo..." : "Devolver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        open={openDeleteModal}
        onOpenChange={(open) => {
          setOpenDeleteModal(open);
          if (!open) setDemandaParaDeletar(null);
        }}
        onConfirm={handleDeletar}
        title="Excluir demanda"
        description="Você tem certeza que deseja excluir a demanda sobre"
        itemName={demandaParaDeletar?.tipo || ""}
      />
    </div>
  );
}
