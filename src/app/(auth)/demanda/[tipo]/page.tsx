// /app/(auth)/demanda/[tipo]/page.tsx

"use client";

import CardDemanda from "@/components/cardDemanda";
import Banner from "@/components/banner";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { CreateDemandaDialog } from "@/components/CreateDemandaDialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tipoDemandaService } from "@/services";

export default function DemandaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  
  const [imageBlobs, setImageBlobs] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  
  const tipoFiltro = decodeURIComponent(params.tipo as string);

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
      console.log('Resultado da API:', result);
      return result.data?.docs || [];
    },
    enabled: !!tipoFiltro,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });

  // Os dados já vêm filtrados do backend
  const cardsFiltrados = demandasData || [];
  const bannerData = cardsFiltrados[0] || null;

  // Carregar imagens quando os dados das demandas são carregados
  useEffect(() => {
    const loadImages = async () => {
      if (!demandasData) return;

      const newImageBlobs: Record<string, string> = {};

      for (const demanda of demandasData) {
        // Se já tem link_imagem, testa se está acessível
        if (demanda.link_imagem) {
          console.log(`Testando link_imagem para ${demanda._id}:`, demanda.link_imagem);

          try {
            // Testa se conseguimos carregar a imagem completamente
            console.log(`Testando carregamento completo de link_imagem para ${demanda._id}...`);
            const imageResponse = await fetch(demanda.link_imagem);
            const contentType = imageResponse.headers.get('content-type');

            if (imageResponse.ok && contentType?.startsWith('image/')) {
              const imageBlob = await imageResponse.blob();
              if (imageBlob.size > 0) {
                console.log(`✅ link_imagem carregada com sucesso para ${demanda._id}:`, {
                  size: imageBlob.size,
                  type: contentType
                });
                continue;
              }
            }

            console.warn(`❌ link_imagem não pôde ser carregada para ${demanda._id}:`, {
              status: imageResponse.status,
              contentType,
              url: demanda.link_imagem,
              responseText: contentType?.includes('text/html') ? await imageResponse.text().then(text => text.substring(0, 200) + '...') : 'Não é HTML'
            });
          } catch (error) {
            console.warn(`❌ Erro ao carregar link_imagem para ${demanda._id}:`, error);
          }
        }

        // Se não tem link_imagem ou não está acessível, busca blob
        try {
          console.log(`Buscando blob para demanda ${demanda._id}...`);
          const blob = await tipoDemandaService.buscarFotoTipoDemanda(demanda._id);
          const imageUrl = URL.createObjectURL(blob);
          newImageBlobs[demanda._id] = imageUrl;
          console.log(`✅ Blob carregado para ${demanda._id}:`, {
            size: blob.size,
            type: blob.type,
            url: imageUrl.substring(0, 50) + '...'
          });
        } catch (error) {
          console.warn(`❌ Erro ao carregar blob para demanda ${demanda._id}:`, error);
        }
      }

      setImageBlobs(newImageBlobs);
    };

    loadImages();
  }, [demandasData]);

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
            {cardsFiltrados.map((card) => {
              const imagemFinal = card.link_imagem || imageBlobs[card._id] || '';
              console.log(`Renderizando card ${card._id}:`, {
                titulo: card.titulo,
                link_imagem: card.link_imagem,
                blob_imagem: imageBlobs[card._id] ? 'blob disponível' : 'sem blob',
                imagem_final: imagemFinal ? 'imagem definida' : 'sem imagem'
              });

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