// src/app/(auth)/admin/demanda/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Banner from "@/components/banner";
import { ChevronLeft, ChevronRight, ClipboardList, Filter, Calendar } from "lucide-react";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/services/api";
import type { Demanda as DemandaAPI } from "@/types";
import DetalhesDemandaSecretariaModal from "@/components/detalheDemandaSecretariaModal";
import { demandaService } from "@/services/demandaService";
import { secretariaService } from "@/services/secretariaService";
import { tipoDemandaService } from "@/services/tipoDemandaService";

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
  secretaria?: string | { _id: string; nome: string };
  data_criacao?: string;
}

export default function DemandasAdminPage() {
  const [abaAtiva, setAbaAtiva] = useState<"todas" | "em-aberto" | "em-andamento" | "concluidas" | "recusadas">("todas");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroSecretaria, setFiltroSecretaria] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [demandaSelecionada, setDemandaSelecionada] = useState<DemandaCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const ITENS_POR_PAGINA = 9;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/funcionario');
    }
  }, [status, router]);

  // Buscar todas as demandas
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['demandas-admin'],
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

  // Buscar secretarias
  const { data: secretariasResponse } = useQuery({
    queryKey: ['secretarias-filter'],
    queryFn: async () => {
      try {
        const result = await secretariaService.buscarSecretarias({}, 100, 1);
        return result;
      } catch (err) {
        console.error("Erro ao buscar secretarias:", err);
        throw err;
      }
    },
    enabled: status === 'authenticated',
  });

  // Buscar tipos de demanda
  const { data: tiposResponse } = useQuery({
    queryKey: ['tipos-demanda-filter'],
    queryFn: async () => {
      try {
        const result = await tipoDemandaService.buscarTiposDemanda();
        return result;
      } catch (err) {
        console.error("Erro ao buscar tipos de demanda:", err);
        throw err;
      }
    },
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

  const demandas: DemandaCard[] = response?.data?.docs?.map((demanda: any) => {
    return {
      id: demanda._id,
      titulo: `Demanda sobre ${demanda.tipo}`,
      descricao: demanda.descricao,
      tipo: demanda.tipo.toLowerCase(),
      status: demanda.status || 'Em aberto',
      imagem: demanda.link_imagem 
        ? (Array.isArray(demanda.link_imagem) 
            ? demanda.link_imagem 
            : [demanda.link_imagem])
        : undefined,
      endereco: demanda.endereco ? {
        bairro: demanda.endereco.bairro,
        tipoLogradouro: demanda.endereco.logradouro.split(' ')[0] || 'Rua',
        logradouro: demanda.endereco.logradouro,
        numero: demanda.endereco.numero,
      } : undefined,
      usuarios: demanda.usuarios,
      resolucao: demanda.resolucao,
      motivo_devolucao: demanda.motivo_devolucao,
      link_imagem_resolucao: demanda.link_imagem_resolucao 
        ? (Array.isArray(demanda.link_imagem_resolucao) 
            ? demanda.link_imagem_resolucao 
            : [demanda.link_imagem_resolucao])
        : undefined,
      secretaria: demanda.secretaria || (demanda.secretarias && demanda.secretarias[0]),
      data_criacao: demanda.createdAt || demanda.data_criacao,
    };
  }) || [];

  const secretarias = secretariasResponse?.data?.docs || [];
  const tiposDemanda = tiposResponse?.data?.docs || [];

  const handleFiltroChange = () => {
    setPaginaAtual(1);
  };

  const handlePaginaAnterior = () => {
    setPaginaAtual(paginaAtual - 1);
  };

  const handleProximaPagina = () => {
    setPaginaAtual(paginaAtual + 1);
  };

  const handleVisualizarDemanda = (id: string) => {
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

  const getStatusBadge = (status: string) => {
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

  const demandasFiltradas = demandas.filter(demanda => {
    // Filtro por aba (status)
    let statusMatch = true;
    if (abaAtiva === "em-aberto") {
      statusMatch = demanda.status === "Em aberto";
    } else if (abaAtiva === "em-andamento") {
      statusMatch = demanda.status === "Em andamento";
    } else if (abaAtiva === "concluidas") {
      statusMatch = demanda.status === "Concluída";
    } else if (abaAtiva === "recusadas") {
      statusMatch = demanda.status === "Recusada";
    }

    // Filtro adicional de status (select)
    if (filtroStatus !== "todos") {
      statusMatch = statusMatch && demanda.status === filtroStatus;
    }

    // Filtro por tipo
    const tipoMatch = filtroTipo === "todos" || demanda.tipo === filtroTipo.toLowerCase();

    // Filtro por secretaria
    let secretariaMatch = true;
    if (filtroSecretaria !== "todas") {
      const secretariaId = typeof demanda.secretaria === 'object' && demanda.secretaria?._id 
        ? demanda.secretaria._id 
        : demanda.secretaria;
      secretariaMatch = secretariaId === filtroSecretaria;
    }

    // Filtro por data
    let dataMatch = true;
    if (dataInicio || dataFim) {
      const dataDemanda = demanda.data_criacao ? new Date(demanda.data_criacao) : null;
      if (dataDemanda) {
        if (dataInicio) {
          const inicio = new Date(dataInicio);
          inicio.setHours(0, 0, 0, 0);
          dataMatch = dataMatch && dataDemanda >= inicio;
        }
        if (dataFim) {
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          dataMatch = dataMatch && dataDemanda <= fim;
        }
      } else {
        dataMatch = false;
      }
    }

    return statusMatch && tipoMatch && secretariaMatch && dataMatch;
  });

  const totalPaginas = Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
  const demandasPaginadas = demandasFiltradas.slice(indiceInicial, indiceFinal);

  // Resetar filtros
  const handleResetarFiltros = () => {
    setFiltroTipo("todos");
    setFiltroSecretaria("todas");
    setFiltroStatus("todos");
    setDataInicio("");
    setDataFim("");
    setAbaAtiva("todas");
    setPaginaAtual(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-global-bg">
        <Banner
          icone={ClipboardList}
          titulo="Gestão de Demandas"
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
          titulo="Gestão de Demandas"
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
        titulo="Gestão de Demandas"
        className="mb-6 md:mb-8"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-6 md:py-8">
        <div className="mx-auto">
          {/* Abas de Status */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => {
                  setAbaAtiva("todas");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  abaAtiva === "todas"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Todas
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  abaAtiva === "todas" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                }`}>
                  {demandas.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setAbaAtiva("em-aberto");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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

              <button
                onClick={() => {
                  setAbaAtiva("recusadas");
                  setPaginaAtual(1);
                }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  abaAtiva === "recusadas"
                    ? "border-[#337695] text-[#337695]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recusadas
                {demandas.filter(d => d.status === "Recusada").length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    abaAtiva === "recusadas" ? "bg-blue-100 text-[#337695]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {demandas.filter(d => d.status === "Recusada").length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtros</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Tipo */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Tipo de Demanda</label>
                <Select value={filtroTipo} onValueChange={(value) => { setFiltroTipo(value); handleFiltroChange(); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tiposDemanda.map((tipo) => (
                      <SelectItem key={tipo._id} value={tipo.tipo.toLowerCase()}>
                        {tipo.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Secretaria */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Secretaria</label>
                <Select value={filtroSecretaria} onValueChange={(value) => { setFiltroSecretaria(value); handleFiltroChange(); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as secretarias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as secretarias</SelectItem>
                    {secretarias.map((secretaria) => (
                      <SelectItem key={secretaria._id} value={secretaria._id}>
                        {secretaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Status */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                <Select value={filtroStatus} onValueChange={(value) => { setFiltroStatus(value); handleFiltroChange(); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os status" />
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

              {/* Filtro por Data - Data Início */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Data Início</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => { setDataInicio(e.target.value); handleFiltroChange(); }}
                    className="w-full"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Filtro por Data - Data Fim */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Data Fim</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => { setDataFim(e.target.value); handleFiltroChange(); }}
                    className="w-full"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Botão Resetar Filtros */}
              <div className="flex items-end">
                <Button
                  onClick={handleResetarFiltros}
                  className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Resultado dos Filtros */}
          <div className="mb-4 text-sm text-gray-600">
            Exibindo {demandasFiltradas.length} demanda{demandasFiltradas.length !== 1 ? 's' : ''} de {demandas.length} no total
          </div>

          {demandasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {demandasPaginadas.map((demanda) => {
                const secretariaNome = typeof demanda.secretaria === 'object' && demanda.secretaria?.nome 
                  ? demanda.secretaria.nome 
                  : 'Não atribuída';

                return (
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

                    <div className="mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(demanda.status)}`}>
                        {demanda.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-900/80 mb-4 flex-1 line-clamp-3">
                      {demanda.descricao}
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      <div className="font-medium">Secretaria: {secretariaNome}</div>
                      {demanda.data_criacao && (
                        <div className="mt-1">
                          Criada em: {new Date(demanda.data_criacao).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleVisualizarDemanda(demanda.id)}
                      className="w-full bg-[#337695] hover:bg-[#2c5f7a] text-white"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma demanda encontrada
              </h3>
              <div className="text-sm text-gray-500 text-center">
                Não há demandas que correspondam aos filtros selecionados.
              </div>
              <Button
                onClick={handleResetarFiltros}
                className="mt-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                Limpar Filtros
              </Button>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePaginaAnterior}
                disabled={paginaAtual === 1}
                className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-900">
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
          )}
        </div>
      </div>

      {demandaSelecionada && (
        <DetalhesDemandaSecretariaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          demanda={demandaSelecionada}
          onConfirmar={() => {}}
          onRejeitar={() => {}}
          operadores={[]}
          isConfirmando={false}
          isRejeitando={false}
        />
      )}
    </div>
  );
}
