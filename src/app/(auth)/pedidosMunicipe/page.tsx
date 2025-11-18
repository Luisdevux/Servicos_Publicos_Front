"use client";

import { useState, useEffect } from "react";
import Banner from "@/components/banner";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardPedido from "@/components/cardPedido";
import CardPedidoSkeleton from "@/components/CardPedidoSkeleton";
import type { Pedido } from "@/types";
import type { Demanda } from "@/types/demanda";
import DetalhesDemandaModal from "@/components/detalheDemandaModal";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { demandaService } from "@/services";
import { 
  transformarDemandaParaPedido, 
  obterStatusPorFiltro, 
  obterTextoFiltro,
  type BuscarDemandasParams 
} from "@/lib/demandaUtils";


export default function MeusPedidosPage() {
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const ITENS_POR_PAGINA = 10;

  // Query para buscar contadores (todas as demandas sem filtro de status)
  const { data: contadoresData } = useQuery({
    queryKey: ['demandas-contadores'],
    queryFn: async () => {
      // Buscar primeira página para saber o total
      const firstPage = await demandaService.buscarDemandas({ 
        page: 1, 
        limit: 100 
      });

      if (!firstPage.data) return [];

      const totalPages = firstPage.data.totalPages;
      const todasDemandas: Demanda[] = [...(firstPage.data.docs || [])];

      // Se houver mais páginas, buscar todas em paralelo
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            demandaService.buscarDemandas({ page, limit: 100 })
          );
        }

        const results = await Promise.all(promises);
        results.forEach(result => {
          if (result.data?.docs) {
            todasDemandas.push(...result.data.docs);
          }
        });
      }

      return todasDemandas;
    },
    enabled: !isAuthLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const {data: response, isLoading, error } = useQuery ({
    queryKey: ['demandas', paginaAtual, filtroSelecionado],
    queryFn: async () => {
      const statusFilters = obterStatusPorFiltro(filtroSelecionado);
      const limit = ITENS_POR_PAGINA;
      
      const params: BuscarDemandasParams = { 
        page: paginaAtual,
        limit: limit
      };
      
      // Só adiciona o filtro de status se não for "todos"
      if (statusFilters && statusFilters.length > 0) {
        params.status = statusFilters[0];
      }

      const result = await demandaService.buscarDemandas(params);
      return result;
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

  const pedidos = response?.data?.docs 
    ? response.data.docs.map(transformarDemandaParaPedido) 
    : [];

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

  const totalPaginas = response?.data?.totalPages || 1;
  const totalDocs = response?.data?.totalDocs || 0;

  // Contadores por status usando todas as demandas
  const todasDemandas = (contadoresData as Demanda[]) || [];
  const contadorTodos = todasDemandas.length;
  const contadorAceitos = todasDemandas.filter((d: Demanda) => 
    d.status === "Em andamento"
  ).length;
  const contadorConcluidas = todasDemandas.filter((d: Demanda) => 
    d.status === "Concluída"
  ).length;
  const contadorRecusados = todasDemandas.filter((d: Demanda) => 
    d.status === "Recusada"
  ).length;
  const contadorAguardando = todasDemandas.filter((d: Demanda) => 
    d.status === "Em aberto"
  ).length;

  return (
    <div className="min-h-screen bg-global-bg">
      <Banner
        icone={ClipboardList}
        titulo="Meus Pedidos"
        className="mb-4"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-4">
        <div className="mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => router.push('/')}
              className="h-10 px-4 bg-transparent border border-gray-200 text-global-text-primary hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">Voltar</span>
            </Button>
          </div>

          {/* Abas de Status com Separador */}
          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-4 md:gap-8 min-w-max md:min-w-0">
              <button
                onClick={() => {
                  setFiltroSelecionado("todos");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  filtroSelecionado === "todos"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Todas
                {contadorTodos > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filtroSelecionado === "todos" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorTodos}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setFiltroSelecionado("aguardando");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  filtroSelecionado === "aguardando"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Aguardando Aprovação
                {contadorAguardando > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filtroSelecionado === "aguardando" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorAguardando}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setFiltroSelecionado("aceito");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  filtroSelecionado === "aceito"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Aceitas
                {contadorAceitos > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filtroSelecionado === "aceito" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorAceitos}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setFiltroSelecionado("concluida");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  filtroSelecionado === "concluida"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Concluídas
                {contadorConcluidas > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filtroSelecionado === "concluida" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorConcluidas}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setFiltroSelecionado("recusado");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  filtroSelecionado === "recusado"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recusadas
                {contadorRecusados > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filtroSelecionado === "recusado" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorRecusados}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-sm text-gray-500">
              {isLoading ? "Carregando..." : obterTextoFiltro(totalDocs, filtroSelecionado)}
            </span>
          </div>

          <div className="min-h-[600px] flex flex-col justify-between">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardPedidoSkeleton key={index} />
              ))}
            </div>
          ) : pedidos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidos.map((pedido) => (
                <CardPedido
                  key={pedido.id}
                  pedido={pedido}
                  onVerMais={handleVerMais}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-global-text-primary mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {filtroSelecionado === "todos" 
                  ? "Você ainda não possui pedidos registrados."
                  : `Não há pedidos com o filtro "${filtroSelecionado}".`
                }
              </p>
            </div>
          )}

          {pedidos.length > 0 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                onClick={handlePaginaAnterior}
                disabled={!response?.data?.hasPrevPage}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 text-sm text-global-text-primary">
                <span>Página {paginaAtual} de {totalPaginas}</span>
              </div>
              
              <button
                onClick={handleProximaPagina}
                disabled={!response?.data?.hasNextPage}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Próxima página"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      <DetalhesDemandaModal
        pedido={pedidoSelecionado}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
