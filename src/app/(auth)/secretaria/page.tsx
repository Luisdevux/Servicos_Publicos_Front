"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Banner from "@/components/banner";
import { ChevronLeft, ChevronRight, ClipboardList, Filter } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { demandaService } from "@/services/demandaService";
import { ApiError } from "@/services/api";
import type { Demanda as DemandaAPI } from "@/types";

interface DemandaCard {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
}

export default function PedidosSecretariaPage() {
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const { data: session } = useSession();
  const router = useRouter();

  const ITENS_POR_PAGINA = 6;

  // Buscar demandas da API
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
  });

  // Detectar token expirado e redirecionar para login
  useEffect(() => {
    if (error) {
      if (error instanceof ApiError && error.status === 498) {
        // Token expirado - limpar storage e redirecionar
        console.warn("Token expirado. Redirecionando para login...");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login/funcionario?expired=true');
      }
    }
  }, [error, router]);

  const demandas: DemandaCard[] = response?.data?.docs?.map((demanda: DemandaAPI) => ({
    id: demanda._id,
    titulo: `Demanda sobre ${demanda.tipo}`,
    descricao: demanda.descricao,
    tipo: demanda.tipo.toLowerCase(),
  })) || [];

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
    // Navegar para página de análise ou abrir modal
    console.log("Analisar demanda:", id);
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
    if (filtroSelecionado === "todos") {
      return true;
    }
    return demanda.tipo === filtroSelecionado.toLowerCase();
  });

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
          backgroundColor="#5b21b6"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Carregando demandas...</div>
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
          backgroundColor="#5b21b6"
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
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
        backgroundColor="#5b21b6"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-6 md:py-8">
        <div className="mx-auto">
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
            <div className="text-sm text-gray-500 text-center">
              {filtroSelecionado === "todos" 
                ? "Não há pedidos registrados no momento."
                : `Não há pedidos com status "${filtroSelecionado}".`
              }
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
  );
}
