"use client";

import { useState, useEffect } from "react";
import Banner from "@/components/banner";
import { ChevronLeft, ChevronRight, ClipboardList, Filter } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CardPedido from "@/components/cardPedido";
import type { Pedido } from "@/types";
import type { Demanda } from "@/types/demanda";
import DetalhesDemandaModal from "@/components/detalheDemandaModal";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { demandaService } from "@/services";


export default function MeusPedidosPage() {
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const getStatusFilters = (filtro: string): string[] | undefined => {
    if (filtro === "todos") return undefined;
    if (filtro === "aceito") return ["Em andamento", "Concluída"]; 
    if (filtro === "recusado") return ["Recusada"];
    if (filtro === "aguardando") return ["Em aberto"];
    return [filtro];
  };

  const {data: response, isLoading, error } = useQuery ({
    queryKey: ['demandas', paginaAtual, filtroSelecionado],
    queryFn: async () => {
      const statusFilters = getStatusFilters(filtroSelecionado);
      const limit = 10;
      
      if (filtroSelecionado === "aceito" && statusFilters) {
        const buscarTodasPaginas = async (status: string) => {
          let todasPaginas: any[] = [];
          let paginaAtual = 1;
          let temMaisPaginas = true;

          while (temMaisPaginas) {
            const resultado = await demandaService.buscarDemandas({ 
              page: paginaAtual, 
              limit: 100,
              status: status 
            });
            
            if (resultado.data?.docs) {
              todasPaginas = [...todasPaginas, ...resultado.data.docs];
            }

            temMaisPaginas = resultado.data?.hasNextPage || false;
            paginaAtual++;
          }

          return todasPaginas;
        };

        const [docsEmAndamento, docsConcluida] = await Promise.all([
          buscarTodasPaginas(statusFilters[0]),
          buscarTodasPaginas(statusFilters[1])
        ]);

        const allDocs = [...docsEmAndamento, ...docsConcluida];

        allDocs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        const totalDocs = allDocs.length;
        const totalPages = Math.ceil(totalDocs / limit);
        const startIndex = (paginaAtual - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDocs = allDocs.slice(startIndex, endIndex);

        return {
          message: "Demandas buscadas com sucesso",
          errors: [],
          data: {
            docs: paginatedDocs,
            totalDocs,
            totalPages,
            page: paginaAtual,
            limit,
            hasNextPage: paginaAtual < totalPages,
            hasPrevPage: paginaAtual > 1,
            nextPage: paginaAtual < totalPages ? paginaAtual + 1 : null,
            prevPage: paginaAtual > 1 ? paginaAtual - 1 : null,
            pagingCounter: startIndex + 1,
          }
        };
      } else {
        const params: { page: number; limit?: number; status?: string } = { 
          page: paginaAtual,
          limit: limit
        };
        if (statusFilters && statusFilters.length > 0) {
          params.status = statusFilters[0];
        }
        const result = await demandaService.buscarDemandas(params);
        console.log(result);
        return result;
      }
    },
    enabled: !isAuthLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (response?.data?.page && response.data.page !== paginaAtual) {
      setPaginaAtual(response.data.page);
    }
  }, [response?.data?.page, paginaAtual]);

  const transformDemandaToPedido = (demanda: Demanda): Pedido => {
    const statusMapping: Record<string, "Em aberto" | "Em andamento" | "Concluída" | "Recusada"> = {
      "Em aberto": "Em aberto",
      "Em andamento": "Em andamento", 
      "Concluída": "Concluída",
      "Recusada": "Recusada"
    };

    return {
      id: demanda._id,
      titulo: `Demanda sobre ${demanda.tipo}`,
      status: statusMapping[demanda.status] || "Em aberto",
      descricao: demanda.descricao,
      link_imagem: demanda.link_imagem 
        ? (Array.isArray(demanda.link_imagem) 
            ? demanda.link_imagem 
            : [demanda.link_imagem])
        : undefined,
      link_imagem_resolucao: demanda.link_imagem_resolucao 
        ? (Array.isArray(demanda.link_imagem_resolucao) 
            ? demanda.link_imagem_resolucao 
            : [demanda.link_imagem_resolucao])
        : undefined,
      endereco: demanda.endereco ? {
        bairro: demanda.endereco.bairro || "",
        logradouro: demanda.endereco.logradouro || "",
        numero: String(demanda.endereco.numero) || "",
        cep: demanda.endereco.cep || "",
        complemento: demanda.endereco.complemento || "",
      } : undefined,
      progresso: {
        aprovado: true,
        emProgresso: demanda.status === "Em andamento" || demanda.status === "Concluída" ,
        concluido: demanda.status === "Concluída" 
      },
      conclusao: demanda.status === "Concluída" && demanda.resolucao ? {
        descricao: demanda.resolucao,
        imagem: demanda.link_imagem_resolucao 
          ? (Array.isArray(demanda.link_imagem_resolucao) 
              ? demanda.link_imagem_resolucao 
              : [demanda.link_imagem_resolucao])
          : undefined,
        dataConclusao: demanda.updatedAt ? new Date(demanda.updatedAt).toLocaleDateString('pt-BR') : ""
      } : undefined,
      avaliacao: demanda.status === "Concluída" && demanda.feedback && demanda.avaliacao_resolucao ? {
        feedback: demanda.feedback,
        avaliacao_resolucao: demanda.avaliacao_resolucao
      } : undefined
    };
  };

  const pedidos = response?.data?.docs ? response.data.docs.map(transformDemandaToPedido) : [];

  const handleFiltroChange = (value: string) => {
    setFiltroSelecionado(value);
    setPaginaAtual(1); 
  };

  const handlePaginaAnterior = () => {
    if (response?.data?.hasPrevPage) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const handleProximaPagina = () => {
    if (response?.data?.hasNextPage) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const handleVerMais = (id: string) => {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
      setPedidoSelecionado(pedido);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPedidoSelecionado(null);
  };

  const pedidosFiltrados = pedidos;
  const totalPaginas = response?.data?.totalPages || 1;
  const totalDocs = response?.data?.totalDocs || 0;
  const pedidosPaginados = pedidosFiltrados;

  return (
    <div className="min-h-screen bg-global-bg">
      <Banner
        icone={ClipboardList}
        titulo="Meus Pedidos"
        className="mb-6 md:mb-8"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-6 md:py-8">
        <div className="mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Button
                onClick={() => router.push('/')}
                className="h-10 px-3 rounded-md bg-transparent border border-gray-200 text-global-text-primary hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-global-text-primary" />
              <span className="text-sm text-global-text-primary">Filtrar por:</span>
              <Select value={filtroSelecionado} onValueChange={handleFiltroChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Todos os pedidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os pedidos</SelectItem>
                  <SelectItem value="aceito">Aceitos</SelectItem>
                  <SelectItem value="recusado">Recusados</SelectItem>
                  <SelectItem value="aguardando">Aguardando aprovação</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-global-text-primary ml-2">
                {isLoading ? (
                  "Carregando..."
                ) : (
                  `${response?.data?.totalDocs ?? 0} ${(response?.data?.totalDocs ?? 0) === 1 ? 'pedido' : 'pedidos'} ${filtroSelecionado === 'todos' ? 'no total' : 'encontrado(s)'}`
                )}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-16 mb-8 py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-global-accent border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500">Carregando seus pedidos...</p>
          </div>
        ) : pedidosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-8">
              {pedidosPaginados.map((pedido) => (
                <CardPedido
                  key={pedido.id}
                  pedido={pedido}
                  onVerMais={handleVerMais}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16 mb-8 py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-global-text-primary mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {filtroSelecionado === "todos" 
                ? "Você ainda não possui pedidos registrados."
                : `Não há pedidos com status "${filtroSelecionado}".`
              }
            </p>
          </div>
        )}

  {pedidosFiltrados.length > 0 && (
          <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePaginaAnterior}
                disabled={!response?.data?.hasPrevPage}
                className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 text-sm text-global-text-primary">
                <span>Página {paginaAtual} de {totalPaginas}</span>
              </div>
              
              <button
                onClick={handleProximaPagina}
                disabled={!response?.data?.hasNextPage}
                className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
        )}

      </div>

      <DetalhesDemandaModal
        pedido={pedidoSelecionado}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
