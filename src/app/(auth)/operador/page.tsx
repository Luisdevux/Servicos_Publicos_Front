// src/app/(auth)/operador/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Banner from "@/components/banner";
import { ChevronLeft, ChevronRight, ClipboardList, Filter } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import type { Demanda as DemandaAPI } from "@/types";
import DetalhesDemandaOperadorModal from "@/components/detalheDemandaOperadorModal";
import { demandaService } from "@/services/demandaService";
import { toast } from "sonner";

interface DemandaCard {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  imagem?: string | string[];
  endereco?: {
    bairro: string;
    tipoLogradouro: string;
    logradouro: string;
    numero: string;
  };
  usuarios?: (string | { _id: string; nome: string })[];
  resolucao?: string;
  motivo_devolucao?: string;
  link_imagem_resolucao?: string | string[];
}

export default function PedidosOperadorPage() {
  const [abaAtiva, setAbaAtiva] = useState<"aguardando-resolucao" | "concluidas">("aguardando-resolucao");
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [demandaSelecionada, setDemandaSelecionada] = useState<DemandaCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const ITENS_POR_PAGINA = 6;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/funcionario');
    }
  }, [status, router]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['demandas-operador'],
    queryFn: async () => {
      try {
        const result = await demandaService.buscarDemandas();
        console.log("Demandas carregadas:", result);
        return result;
      } catch (err) {
        console.error("Erro ao buscar demandas:", err);
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: status === 'authenticated',
  });

  useEffect(() => {
    if (error) {
      if (error instanceof ApiError && error.status === 498) {
        console.warn("Token expirado. Redirecionando para login...");
        router.push('/login/funcionario?expired=true');
      }
    }
  }, [error, router]);

  const demandas: DemandaCard[] = response?.data?.docs?.map((demanda: DemandaAPI) => ({
    id: demanda._id,
    titulo: `Demanda sobre ${demanda.tipo}`,
    descricao: demanda.descricao,
    tipo: demanda.tipo.toLowerCase(),
    status: demanda.status || 'Em aberto',
    imagem: demanda.link_imagem,
    endereco: demanda.endereco ? {
      bairro: demanda.endereco.bairro,
      tipoLogradouro: demanda.endereco.logradouro.split(' ')[0] || 'Rua',
      logradouro: demanda.endereco.logradouro,
      numero: demanda.endereco.numero,
    } : undefined,
    usuarios: demanda.usuarios,
    resolucao: demanda.resolucao,
    motivo_devolucao: demanda.motivo_devolucao,
    link_imagem_resolucao: demanda.link_imagem_resolucao,
  })) || [];

  const devolverMutation = useMutation({
    mutationFn: async ({ demandaId, motivo }: { demandaId: string; motivo: string }) => {
      return demandaService.devolverDemanda(demandaId, {
        motivo_devolucao: motivo
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas-operador'] });
      toast.success('Demanda devolvida', {
        description: 'A demanda foi devolvida para a secretaria.'
      });
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Erro ao devolver demanda:', error);
      toast.error('Erro ao devolver demanda', {
        description: 'Não foi possível devolver a demanda. Tente novamente.'
      });
    },
  });

  const resolverMutation = useMutation({
    mutationFn: async ({ demandaId, descricao, imagens }: { demandaId: string; descricao: string; imagens: File[] }) => {
      return demandaService.resolverDemanda(demandaId, {
        resolucao: descricao,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas-operador'] });
      toast.success('Demanda resolvida com sucesso!', {
        description: 'A demanda foi marcada como concluída.'
      });
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Erro ao resolver demanda:', error);
      toast.error('Erro ao resolver demanda', {
        description: 'Não foi possível resolver a demanda. Tente novamente.'
      });
    },
  });

  const handleFiltroChange = (value: string) => {
    setFiltroSelecionado(value);
    setPaginaAtual(1); 
  };

  const handlePaginaAnterior = () => {
    setPaginaAtual(paginaAtual - 1);
  };

  const handleProximaPagina = () => {
    setPaginaAtual(paginaAtual + 1);
  };

  const handleAnalisarDemanda = (id: string) => {
    const demanda = demandas?.find((d) => d.id === id);
    if (demanda) {
      setDemandaSelecionada(demanda);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDemandaSelecionada(null);
  };

  const handleDevolver = async (demandaId: string, motivo: string) => {
    devolverMutation.mutate({ demandaId, motivo });
  };

  const handleResolver = async (demandaId: string, descricao: string, imagens: File[]) => {
    resolverMutation.mutate({ demandaId, descricao, imagens });
  };

  const getStatusColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    switch (tipoLower) {
      case "iluminação":
        return "bg-green-100 text-green-800";
      case "coleta":
        return "bg-blue-100 text-blue-800";
      case "saneamento":
        return "bg-cyan-100 text-cyan-800";
      case "árvores":
        return "bg-emerald-100 text-emerald-800";
      case "animais":
        return "bg-orange-100 text-orange-800";
      case "pavimentação":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filtrar demandas por status baseado na aba ativa
  const demandasPorStatus = demandas.filter(demanda => {
    const statusNormalizado = demanda.status.toLowerCase();
    
    if (abaAtiva === "aguardando-resolucao") {
      return statusNormalizado === "em andamento";
    } else if (abaAtiva === "concluidas") {
      return statusNormalizado === "concluída" || statusNormalizado === "concluida";
    }
    
    return false;
  });

  const demandasFiltradas = demandasPorStatus.filter(demanda => {
    if (filtroSelecionado === "todos") {
      return true;
    }
    return demanda.tipo === filtroSelecionado.toLowerCase();
  });

  // Contador de demandas por aba
  const contadorAguardandoResolucao = demandas.filter(d => 
    d.status.toLowerCase() === "em andamento"
  ).length;

  const contadorConcluidas = demandas.filter(d => 
    d.status.toLowerCase() === "concluída" || d.status.toLowerCase() === "concluida"
  ).length;

  const totalPaginas = Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const demandasPaginadas = demandasFiltradas.slice(indiceInicial, indiceFinal);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--global-bg)]">
        <Banner
          icone={ClipboardList}
          titulo="Pedidos recebidos"
          className="mb-6 md:mb-8"
          backgroundColor="linear-gradient(135deg, #10b981 0%, #059669 80%)"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando demandas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isTokenExpired = error instanceof ApiError && error.status === 498;
    
    return (
      <div className="min-h-screen bg-[var(--global-bg)]">
        <Banner
          icone={ClipboardList}
          titulo="Pedidos recebidos"
          className="mb-6 md:mb-8"
          backgroundColor="linear-gradient(135deg, #10b981 0%, #059669 80%)"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto px-4">
            <ClipboardList className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">
              {isTokenExpired ? "Sessão expirada" : "Erro ao carregar demandas"}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {isTokenExpired 
                ? "Sua sessão expirou. Você será redirecionado para fazer login novamente..." 
                : (error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.")
              }
            </p>
            {!isTokenExpired && (
              <Button 
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Recarregar página
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--global-bg)]">
      <Banner
        icone={ClipboardList}
        titulo="Pedidos recebidos"
        className="mb-6 md:mb-8"
        backgroundColor="linear-gradient(135deg, #10b981 0%, #059669 80%)"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-6 md:py-8">
        <div className="mx-auto">
          {/* Abas de Status */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => {
                  setAbaAtiva("aguardando-resolucao");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === "aguardando-resolucao"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Aguardando Resolução
                {contadorAguardandoResolucao > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    abaAtiva === "aguardando-resolucao" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorAguardandoResolucao}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setAbaAtiva("concluidas");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === "concluidas"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Concluídas
                {contadorConcluidas > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    abaAtiva === "concluidas" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}>
                    {contadorConcluidas}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">


            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Filtrar por tipo:</span>
              <Select value={filtroSelecionado} onValueChange={handleFiltroChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="iluminação">Iluminação</SelectItem>
                  <SelectItem value="coleta">Coleta</SelectItem>
                  <SelectItem value="saneamento">Saneamento</SelectItem>
                  <SelectItem value="árvores">Árvores</SelectItem>
                  <SelectItem value="animais">Animais</SelectItem>
                  <SelectItem value="pavimentação">Pavimentação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {demandasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-8">
              {demandasPaginadas.map((demanda) => (
                <div 
                  key={demanda.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-700 flex-1">
                      {demanda.titulo}
                    </h3>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusColor(demanda.tipo)}`}>
                      {demanda.tipo}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900/80 mb-6 flex-1 line-clamp-3">
                    {demanda.descricao}
                  </p>
                  
                  <Button 
                    onClick={() => handleAnalisarDemanda(demanda.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Analisar Demanda
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16 mb-8 py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-[var(--global-text-primary)] mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {filtroSelecionado === "todos" 
                ? (abaAtiva === "aguardando-resolucao" 
                    ? "Não há pedidos aguardando resolução no momento."
                    : "Não há pedidos concluídos no momento."
                  )
                : (abaAtiva === "aguardando-resolucao"
                    ? `Não há pedidos aguardando resolução com tipo "${filtroSelecionado}".`
                    : `Não há pedidos concluídos com tipo "${filtroSelecionado}".`
                  )
              }
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePaginaAnterior}
              disabled={paginaAtual === 1}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-[var(--global-text-primary)]">
              <span>Página {paginaAtual} de {totalPaginas}</span>
            </div>
            
            <button
              onClick={handleProximaPagina}
              disabled={paginaAtual === totalPaginas}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {demandaSelecionada && (
        <DetalhesDemandaOperadorModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          demanda={demandaSelecionada}
          onDevolver={handleDevolver}
          onResolver={handleResolver}
          isDevolvendo={devolverMutation.isPending}
          isResolvendo={resolverMutation.isPending}
        />
      )}
    </div>
  );
}
