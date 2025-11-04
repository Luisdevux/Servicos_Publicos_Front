// src/app/(auth)/secretaria/page.tsx

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
import type { Demanda as DemandaAPI, Usuarios } from "@/types";
import DetalhesDemandaSecretariaModal from "@/components/detalheDemandaSecretariaModal";
import { demandaService } from "@/services/demandaService";
import { usuarioService } from "@/services/usuarioService";
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
    numero: number;
  };
  usuarios?: (string | { _id: string; nome: string })[];
  resolucao?: string;
  motivo_devolucao?: string;
  link_imagem_resolucao?: string | string[];
}

export default function PedidosSecretariaPage() {
  const [abaAtiva, setAbaAtiva] = useState<"em-aberto" | "em-andamento" | "concluidas">("em-aberto");
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [demandaSelecionada, setDemandaSelecionada] = useState<DemandaCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const ITENS_POR_PAGINA = 6;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/funcionario');
    }
  }, [status, router]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['demandas-secretaria'],
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

  const demandas: DemandaCard[] = response?.data?.docs?.map((demanda: DemandaAPI) => {
    // Debug: log da demanda completa para ver estrutura
    if (demanda.status === "Concluída") {
      console.log("Demanda da API (Concluída):", demanda);
    }
    
    return {
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
    };
  }) || [];

  const { data: operadoresResponse } = useQuery({
    queryKey: ['operadores'],
    queryFn: async () => {
      try {
        const result = await fetch('/api/auth/secure-fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: '/usuarios?nivel_acesso=operador',
            method: 'GET'
          })
        });

        if (!result.ok) {
          console.error('Erro ao buscar operadores:', result.status, result.statusText);
          throw new Error('Erro ao buscar operadores');
        }

        const payload = await result.json();
        console.log('Operadores recebidos:', payload?.data?.docs?.length || 0);

        return payload;
      } catch (error) {
        console.error('Erro na busca de operadores:', error);
        toast.error('Erro ao carregar operadores', {
          description: 'Não foi possível carregar a lista de operadores. Tente novamente.'
        });
        throw error;
      }
    },
    enabled: status === 'authenticated',
    retry: 1,
  });

  const operadores: Usuarios[] = operadoresResponse?.data?.docs || [];

  const atribuirMutation = useMutation({
    mutationFn: async ({ demandaId, operadorId }: { demandaId: string; operadorId: string }) => {
      return demandaService.atribuirDemanda(demandaId, {
        usuarios: [operadorId]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas-secretaria'] });
      toast.success('Demanda atribuída com sucesso!', {
        description: 'O operador foi notificado e a demanda está em andamento.'
      });
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Erro ao atribuir demanda:', error);
      toast.error('Erro ao atribuir demanda', {
        description: 'Não foi possível atribuir a demanda. Tente novamente.'
      });
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ demandaId, motivo }: { demandaId: string; motivo: string }) => {
      return demandaService.rejeitarDemanda(demandaId, motivo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas-secretaria'] });
      toast.success('Demanda rejeitada', {
        description: 'A demanda foi rejeitada e o solicitante será notificado.'
      });
      handleCloseModal();
    },
    onError: (error) => {
      console.error('Erro ao rejeitar demanda:', error);
      toast.error('Erro ao rejeitar demanda', {
        description: 'Não foi possível rejeitar a demanda. Tente novamente.'
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

  const handleConfirmar = async (demandaId: string, operadorId: string) => {
    atribuirMutation.mutate({ demandaId, operadorId });
  };

  const handleRejeitar = async (demandaId: string, motivo: string) => {
    rejeitarMutation.mutate({ demandaId, motivo });
  };

  const getStatusColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    switch (tipoLower) {
      case "iluminação":
        return "bg-purple-100 text-purple-800";
      case "coleta":
        return "bg-blue-100 text-blue-800";
      case "saneamento":
        return "bg-cyan-100 text-cyan-800";
      case "árvores":
        return "bg-green-100 text-green-800";
      case "animais":
        return "bg-orange-100 text-orange-800";
      case "pavimentação":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const demandasFiltradas = demandas.filter(demanda => {
    // Filtro por status (aba ativa)
    let statusMatch = false;
    if (abaAtiva === "em-aberto") {
      statusMatch = demanda.status === "Em aberto";
    } else if (abaAtiva === "em-andamento") {
      statusMatch = demanda.status === "Em andamento";
    } else if (abaAtiva === "concluidas") {
      statusMatch = demanda.status === "Concluída";
    }

    // Filtro por tipo
    const tipoMatch = filtroSelecionado === "todos" || demanda.tipo === filtroSelecionado.toLowerCase();

    return statusMatch && tipoMatch;
  });

  const totalPaginas = Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const demandasPaginadas = demandasFiltradas.slice(indiceInicial, indiceFinal);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-global-bg">
        <Banner
          icone={ClipboardList}
          titulo="Pedidos recebidos"
          className="mb-6 md:mb-8"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#337695] mx-auto mb-4"></div>
            <div className="text-gray-600">Carregando demandas...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isTokenExpired = error instanceof ApiError && error.status === 498;
    
    return (
      <div className="min-h-screen bg-global-bg">
        <Banner
          icone={ClipboardList}
          titulo="Pedidos recebidos"
          className="mb-6 md:mb-8"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto px-4">
            <ClipboardList className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <div className="text-red-600 font-semibold mb-2">
              {isTokenExpired ? "Sessão expirada" : "Erro ao carregar demandas"}
            </div>
            <div className="text-gray-600 text-sm mb-4">
              {isTokenExpired 
                ? "Sua sessão expirou. Você será redirecionado para fazer login novamente..." 
                : (error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.")
              }
            </div>
            {!isTokenExpired && (
              <Button 
                onClick={() => window.location.reload()}
                className="bg-[#337695] hover:bg-[#2c5f7a] text-white"
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
    <div className="min-h-screen bg-global-bg">
      <Banner
        icone={ClipboardList}
        titulo="Pedidos recebidos"
        className="mb-6 md:mb-8"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-6 md:py-8">
        <div className="mx-auto">
          {/* Abas de Status */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => {
                  setAbaAtiva("em-aberto");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === "em-aberto"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Em Aberto
                {demandas.filter(d => d.status === "Em aberto").length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    abaAtiva === "em-aberto" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {demandas.filter(d => d.status === "Em aberto").length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  setAbaAtiva("em-andamento");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaAtiva === "em-andamento"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Em Andamento
                {demandas.filter(d => d.status === "Em andamento").length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    abaAtiva === "em-andamento" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {demandas.filter(d => d.status === "Em andamento").length}
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
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Concluídas
                {demandas.filter(d => d.status === "Concluída").length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    abaAtiva === "concluidas" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {demandas.filter(d => d.status === "Concluída").length}
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
                  
                  <div className="text-sm text-gray-900/80 mb-6 flex-1 line-clamp-3">
                    {demanda.descricao}
                  </div>
                  
                  <Button 
                    onClick={() => handleAnalisarDemanda(demanda.id)}
                    className="w-full bg-[#337695] hover:bg-[#2c5f7a] text-white"
                  >
                    {abaAtiva === "em-aberto" && "Analisar Demanda"}
                    {abaAtiva === "em-andamento" && "Ver Detalhes"}
                    {abaAtiva === "concluidas" && "Ver Resolução"}
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16 mb-8 py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-global-text-primary mb-2">
              Nenhum pedido encontrado
            </h3>
            <div className="text-sm text-gray-500 text-center">
              {abaAtiva === "em-aberto" && "Não há demandas aguardando análise."}
              {abaAtiva === "em-andamento" && "Não há demandas em andamento no momento."}
              {abaAtiva === "concluidas" && "Não há demandas concluídas ainda."}
            </div>
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
            
            <div className="flex items-center gap-2 text-sm text-global-text-primary">
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
        <DetalhesDemandaSecretariaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          demanda={demandaSelecionada}
          onConfirmar={handleConfirmar}
          onRejeitar={handleRejeitar}
          operadores={operadores}
          isConfirmando={atribuirMutation.isPending}
          isRejeitando={rejeitarMutation.isPending}
        />
      )}
    </div>
  );
}
