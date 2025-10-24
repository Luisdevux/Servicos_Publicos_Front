// /app/demanda/[tipo]/page.tsx

"use client";

import CardDemanda from "@/components/cardDemanda";
import Banner from "@/components/banner";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/hooks/useAuthMutations";
import { CreateDemandaDialog } from "@/components/CreateDemandaDialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tipoDemandaService } from "@/services";

export default function DemandaPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [imageBlobs, setImageBlobs] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  
  const tipoFiltro = decodeURIComponent(params.tipo as string);
  
  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const {
    data: demandasData,
    isLoading: demandasIsLoading,
    isError: demandasIsError,
    error: demandasError,
    refetch: demandasRefetch,
  } = useQuery({
    queryKey: ['tipoDemanda', tipoFiltro],
    queryFn: async () => {
      const token = getAccessToken();
      
      if (!token) {
        router.push('/login');
        throw new Error('Token não encontrado');
      }

      const result = await tipoDemandaService.buscarTiposDemandaPorTipo(token, tipoFiltro, 100);
      return result.data?.docs || [];
    },
    enabled: !!tipoFiltro && !isAuthLoading && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });

  // Os dados já vêm filtrados do backend
  const cardsFiltrados = demandasData || [];
  const bannerData = cardsFiltrados[0] || null;

  // Busca imagem de um card
  const fetchCardImage = async (cardId: string) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const blob = await tipoDemandaService.buscarFotoTipoDemanda(cardId, token);
      const imageUrl = URL.createObjectURL(blob);
      setImageBlobs(prev => ({ ...prev, [cardId]: imageUrl }));
    } catch (error) {
      console.error(`Erro ao buscar imagem do card ${cardId}:`, error);
    }
  };

  // Carrega imagens dos cards quando dados mudam
  useEffect(() => {
    if (cardsFiltrados.length > 0) {
      cardsFiltrados.forEach((card) => {
        fetchCardImage(card._id);
      });
    }
  }, [cardsFiltrados.length]);

  // Limpa URLs de imagem ao desmontar
  useEffect(() => {
    return () => {
      Object.values(imageBlobs).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imageBlobs]);

  // Loading state da autenticação
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center py-40 bg-gray-50" data-test="demanda-loading-container">
        <div className="text-lg text-gray-600" data-test="demanda-loading-message">
          Verificando autenticação...
        </div>
      </div>
    );
  }

  return (
    <div data-test="demanda-page">
      <Banner
        titulo={bannerData?.tipo || tipoFiltro}
        descricao={`Conheça a gama completa de serviços públicos municipais voltados para ${tipoFiltro.toLowerCase()}. Navegue pelas opções, encontre informações detalhadas e acesse o atendimento especializado`}
        icone="/trash-icon.svg"
        className="mb-4"
      />
      
      <div className="px-6 sm:px-6 lg:px-40 py-4" data-test="demanda-page-container">
        <div className="mb-6">
          <Button
            size="lg"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </Button>
        </div>

        {demandasIsLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">Carregando serviços...</div>
          </div>
        )}

        {demandasIsError && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg text-red-600 mb-2">
                Erro ao carregar serviços
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {demandasError?.message || 'Ocorreu um erro inesperado'}
              </p>
              <Button onClick={() => demandasRefetch()}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {!demandasIsLoading && !demandasIsError && cardsFiltrados.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">
                Nenhum serviço encontrado para {tipoFiltro}
              </p>
              <p className="text-sm text-gray-500">
                Tente explorar outras categorias
              </p>
            </div>
          </div>
        )}

        {!demandasIsLoading && !demandasIsError && cardsFiltrados.length > 0 && (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-stretch" 
            data-test="demanda-cards-grid"
          >
            {cardsFiltrados.map((card) => (
              <div key={card._id} data-test={`demanda-card-${card._id}`}>
                <CardDemanda 
                  titulo={card.titulo}
                  descricao={card.descricao}
                  imagem={imageBlobs[card._id] || card.link_imagem || ''}
                  onCreateClick={() => {
                    setSelectedTipo(card.tipo);
                    setIsDialogOpen(true);
                  }}
                />
              </div>
            ))}
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