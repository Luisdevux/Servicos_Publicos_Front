// /app/demanda/[tipo]/page.tsx

"use client";

import CardDemanda from "@/components/cardDemanda";
import Banner from "@/components/banner";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from "@/hooks/useAuthMutations";
import { CreateDemandaDialog } from "@/components/CreateDemandaDialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TipoDemandaModel, ApiResponse, PaginatedResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011';

export default function DemandaPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  const [cards, setCards] = useState<TipoDemandaModel[]>([]);
  const [bannerData, setBannerData] = useState<TipoDemandaModel | null>(null);
  const [imageBlobs, setImageBlobs] = useState<Record<string, string>>({});
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  
  const tipoFiltro = decodeURIComponent(params.tipo as string);
  
  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Busca a imagem de um card específico
  const fetchCardImage = useCallback(async (cardId: string) => {
    const token = getAccessToken();
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tipoDemanda/${cardId}/foto`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageBlobs(prev => ({ ...prev, [cardId]: imageUrl }));
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error(`Erro ao buscar imagem do card ${cardId}:`, error);
    }
  }, [router]);

  // Busca os dados das demandas filtradas por tipo
  const fetchDemandas = useCallback(async () => {
    if (!tipoFiltro) return;

    const token = getAccessToken();
    
    if (!token) {
      router.push('/login');
      return;
    }

    setIsLoadingCards(true);

    try {
      const response = await fetch(`${API_URL}/tipoDemanda`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result: ApiResponse<PaginatedResponse<TipoDemandaModel>> = await response.json();

      if (result.data?.docs?.length) {
        const filteredItems = result.data.docs.filter(
          (item) => item.tipo?.toLowerCase() === tipoFiltro.toLowerCase()
        );

        // Define o primeiro item como banner
        const bannerItem = filteredItems[0];
        if (bannerItem) {
          setBannerData(bannerItem);
          fetchCardImage(bannerItem._id);
        }

        // Atualiza os cards
        setCards(filteredItems);

        // Busca as imagens de todos os cards
        filteredItems.forEach((card) => {
          fetchCardImage(card._id);
        });
      } else {
        setCards([]);
        setBannerData(null);
      }
    } catch (error) {
      console.error('Erro ao buscar demandas:', error);
      setCards([]);
      setBannerData(null);
    } finally {
      setIsLoadingCards(false);
    }
  }, [tipoFiltro, router, fetchCardImage]);

  // Busca as demandas quando a autenticação é concluída
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchDemandas();
    }
  }, [isAuthLoading, isAuthenticated, fetchDemandas]);

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

        {isLoadingCards ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">Carregando serviços...</div>
          </div>
        ) : cards.length === 0 ? (
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
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-stretch" 
            data-test="demanda-cards-grid"
          >
            {cards.map((card) => (
              <div key={card._id} data-test={`demanda-card-${card._id}`}>
                <CardDemanda 
                  titulo={card.titulo}
                  descricao={card.descricao}
                  imagem={imageBlobs[card._id] || card.link_imagem || ''}
                  onCreateClick={() => {
                    setSelectedTipo(card.titulo);
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