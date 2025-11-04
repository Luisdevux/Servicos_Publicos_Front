// src/app/(auth)/demanda/[tipo]/page.tsx

"use client";

import CardDemandaSkeleton from "@/components/CardDemandaSkeleton";
import CardDemanda from "@/components/cardDemanda";
import Banner from "@/components/banner";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreateDemandaDialog } from "@/components/CreateDemandaDialog";
import { Search, ChevronLeft, ChevronRight, SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tipoDemandaService } from "@/services";

export default function DemandaPage() {
  const router = useRouter();
  const params = useParams();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const tipoFiltro = decodeURIComponent(params.tipo as string);
  const tipoFromParams = decodeURIComponent(params.tipo as string);
  const [currentTipo, setCurrentTipo] = useState<string>(tipoFromParams);
  const [tiposUnicos, setTiposUnicos] = useState<string[]>([]);

  // Busca tipos dinamicamente para popular os chips de filtro
  const {
    data: tiposData,
    isLoading: tiposIsLoading,
    isError: tiposIsError,
  } = useQuery({
    queryKey: ['tiposDemandaAll'],
    queryFn: async () => {
      const res = await tipoDemandaService.buscarTiposDemandaPorTipo({}, 1000, 1);
      return res.data?.docs || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (tiposData) {
      const setTipos = new Set<string>();
      tiposData.forEach((d: { tipo?: string }) => {
        if (d?.tipo) setTipos.add(d.tipo);
      });
      setTiposUnicos(Array.from(setTipos));
    }
  }, [tiposData]);

  // Mantem currentTipo sincronizado com a rota para evitar recarregamentos desnecessários
  useEffect(() => {
    if (typeof tipoFromParams === 'string' && tipoFromParams !== currentTipo) {
      setCurrentTipo(tipoFromParams);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoFromParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reseta para a primeira página em nova busca
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const {
    data: demandasData,
    isLoading: demandasIsLoading,
    isError: demandasIsError,
    error: demandasError,
    refetch: demandasRefetch,
  } = useQuery({
    queryKey: ['tipoDemanda', currentTipo, debouncedSearchTerm, page],
    queryFn: async () => {
      const filters = {
        tipo: currentTipo,
        titulo: debouncedSearchTerm,
      };
      // A função de serviço agora recebe o número da página
      const result = await tipoDemandaService.buscarTiposDemandaPorTipo(filters, 10, page);
      return result.data; // Retorna o objeto de paginação completo
    },
    enabled: !!currentTipo,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });

  // Os dados agora estão em demandasData.docs
  const cardsFiltrados = demandasData?.docs || [];
  const bannerData = cardsFiltrados[0] || null;

  return (
    <div data-test="demanda-page">
      <Banner
        titulo={`Serviços de ${bannerData?.tipo || currentTipo}`}
        descricao={`Encontre e solicite o que precisa. Explore abaixo todos os serviços de ${String(currentTipo).toLowerCase()} disponíveis para você. Detalhes, prazos e abertura de demandas em um só lugar.`}
        className="mb-4"
      />

      <div className="px-6 sm:px-6 lg:px-40 py-4" data-test="demanda-page-container">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button
              onClick={() => router.back()}
              className="h-10 px-3 rounded-md bg-transparent border border-gray-200 text-global-text-primary hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </Button>
          </div>
          <div className="w-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-medium text-global-text-secondary">Explore os serviços</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowFilters((s) => !s)}
                    className="h-9 px-3 rounded-md bg-transparent border border-gray-200 text-global-text-primary hover:bg-gray-50"
                  >
                    Filtros
                  </Button>
                  <Button
                    onClick={() => setDebouncedSearchTerm(searchTerm)}
                    className="hidden md:inline h-9 px-3 rounded-md bg-global-accent text-global-bg hover:bg-global-link-hover/90"
                  >
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título do serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-10 h-12 rounded-md bg-white border border-gray-200 shadow-sm w-full"
                />

                {searchTerm && (
                  <button
                    aria-label="Limpar busca"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:bg-gray-100"
                  >
                    <SearchX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showFilters && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiposIsLoading && <span className="text-sm text-gray-500">Carregando filtros...</span>}
                  {!tiposIsLoading && tiposUnicos.length === 0 && (
                    <span className="text-sm text-gray-500">Nenhum filtro disponível</span>
                  )}
                  {!tiposIsLoading && tiposUnicos.map((t: string) => {
                    const active = typeof currentTipo === 'string' && t.toLowerCase() === currentTipo.toLowerCase();
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          // Aplica o filtro sem navegar para evitar remount e perda de blobs
                          setCurrentTipo(t);
                          setPage(1);
                          setSearchTerm('');
                        }}
                        aria-pressed={active}
                        className={`px-3 py-1.5 rounded-full text-sm ${active ? 'bg-global-accent text-global-bg' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {(demandasIsLoading) && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-stretch"
            data-test="demanda-skeleton-grid"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <CardDemandaSkeleton key={index} />
            ))}
          </div>
        )}

        {demandasIsError && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-3">
                <AlertCircle className="h-7 w-7 text-red-500" strokeWidth={2} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800">
                Não foi possível carregar os serviços
              </h3>
              
              <p className="text-sm text-gray-600">
                Ocorreu um erro ao buscar as informações. 
                {demandasError?.message && (
                  <span className="block mt-1 text-xs text-gray-500">
                    {demandasError.message}
                  </span>
                )}
              </p>
              
              <Button 
                onClick={() => demandasRefetch()}
                className="mt-4 bg-global-accent hover:bg-global-link-hover text-white px-6 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 group"
              >
                <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {!demandasIsLoading && !demandasIsError && cardsFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <SearchX className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-gray-500 max-w-md">
              Não encontramos serviços para &quot;{tipoFiltro}&quot;
              {debouncedSearchTerm && ` com o termo &quot;${debouncedSearchTerm}&quot;`}. 
              Por favor, tente uma busca diferente.
            </p>
          </div>
        )}

        {!demandasIsLoading && !demandasIsError && cardsFiltrados.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-stretch"
            data-test="demanda-cards-grid"
          >
            {cardsFiltrados.map((card, index) => {
              return (
                <div 
                  key={card._id} 
                  data-test={`demanda-card-${card._id}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardDemanda
                    titulo={card.titulo}
                    descricao={card.descricao}
                    imagem={card.link_imagem || ''}
                    onCreateClick={() => {
                      setSelectedTipo(card.tipo);
                      setIsDialogOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {!demandasIsLoading && !demandasIsError && cardsFiltrados.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={!demandasData?.hasPrevPage}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-global-text-primary">
              <span>Página {demandasData?.page} de {demandasData?.totalPages}</span>
            </div>
            
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!demandasData?.hasNextPage}
              className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <CreateDemandaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tipoDemanda={selectedTipo}
      />

    </div>
  );
}
