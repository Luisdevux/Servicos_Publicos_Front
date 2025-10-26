// src/app/(auth)/demanda/[tipo]/page.tsx

"use client";

import CardDemanda from "@/components/cardDemanda";
import Banner from "@/components/banner";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreateDemandaDialog } from "@/components/CreateDemandaDialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tipoDemandaService } from "@/services";

export default function DemandaPage() {
  const router = useRouter();
  const params = useParams();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string>('');

  const tipoFiltro = decodeURIComponent(params.tipo as string);

  // Use query para buscar as imagens dos tipoDemandas
  const {
    data: demandasData,
    isLoading: demandasIsLoading,
    isError: demandasIsError,
    error: demandasError,
    refetch: demandasRefetch,
  } = useQuery({
    queryKey: ['tipoDemanda', tipoFiltro],
    queryFn: async () => {
      const result = await tipoDemandaService.buscarTiposDemandaPorTipo(tipoFiltro, 100);
      return result.data?.docs || [];
    },
    enabled: !!tipoFiltro,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });

  // Os dados já vêm filtrados do backend
  const cardsFiltrados = demandasData || [];
  const bannerData = cardsFiltrados[0] || null;

  // Use query para buscar as imagens dos tipoDemandas
  const {
    data: imageBlobs,
    isLoading: imagesIsLoading,
    isError: imagesIsError,
    error: imagesError,
    refetch: imagesRefetch,
  } = useQuery({
    queryKey: ['tipoDemandaImages', tipoFiltro],
    queryFn: async () => {
      if (!cardsFiltrados.length) return {};

      const imagePromises = cardsFiltrados.map(async (card) => {
        try {
          const blob = await tipoDemandaService.buscarFotoTipoDemanda(card._id);
          if (blob.size > 0) {
            return { id: card._id, blob };
          }
          return { id: card._id, blob: null };
        } catch (error) {
          console.warn(`Erro ao buscar imagem para demanda ${card._id}: ${error}`);
          return { id: card._id, blob: null };
        }
      });

      const results = await Promise.all(imagePromises);
      const blobMap: Record<string, Blob | null> = {};

      results.forEach(({ id, blob }) => {
        blobMap[id] = blob;
      });

      return blobMap;
    },
    enabled: !!cardsFiltrados.length && !!tipoFiltro,
    staleTime: 10 * 60 * 1000, // Cache aumentado para 10 minutos
    gcTime: 15 * 60 * 1000, // Garbage collection aumentado
  });

  // Criar URLs das imagens apenas quando necessário
  const imageUrls = useMemo(() => {
    if (!imageBlobs) return {};

    const urls: Record<string, string> = {};
    Object.entries(imageBlobs).forEach(([id, blob]) => {
      if (blob) {
        urls[id] = URL.createObjectURL(blob);
      } else {
        urls[id] = '';
      }
    });

    return urls;
  }, [imageBlobs]);

  // Limpar URLs das imagens ao desmontar ou quando as imagens mudam
  useEffect(() => {
    return () => {
      if (imageUrls) {
        Object.values(imageUrls).forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, [imageUrls]);

  // Cleanup adicional ao desmontar o componente
  useEffect(() => {
    return () => {
      // Cleanup de qualquer blob URL restante
      if (imageUrls) {
        Object.values(imageUrls).forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, []);

  return (
    <div data-test="demanda-page">
      <Banner
        titulo={bannerData?.tipo || tipoFiltro}
        descricao={`Conheça a gama completa de serviços públicos municipais voltados para ${tipoFiltro.toLowerCase()}. Navegue pelas opções, encontre informações detalhadas e acesse o atendimento especializado`}
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
            {cardsFiltrados.map((card) => {
              const imagemFinal = imageUrls?.[card._id] || '';
              return (
                <div key={card._id} data-test={`demanda-card-${card._id}`}>
                  <CardDemanda
                    titulo={card.titulo}
                    descricao={card.descricao}
                    imagem={imagemFinal}
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
      </div>

      <CreateDemandaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tipoDemanda={selectedTipo}
      />

    </div>
  );
}