"use client";

import { useEffect, useMemo, useState } from 'react';
import { MapContainer   , Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseKMLToGeoJSON, extractBairrosFromGeoJSON } from '@/lib/kmlParser';
import type { DemandaPorBairro } from '@/types/admin';

// Fix para ícones do Leaflet no Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface MapBairrosDemandasProps {
  demandasPorBairro: DemandaPorBairro[];
  kmlContent?: string;
}

interface MapControllerProps {
  bairros: Array<{ coordenadas: [number, number][] }>;
}

function MapController({ bairros }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || bairros.length === 0) {
      return;
    }

    const getResponsivePadding = (): [number, number] => {
      if (!map || !map.getContainer) {
        return [40, 40];
      }
      
      const container = map.getContainer();
      const containerWidth = container?.clientWidth || 800;
      if (containerWidth < 640) {
        return [80, 60];
      } else if (containerWidth < 1024) {
        return [60, 50];
      } else {
        return [40, 40];
      }
    };

    // Função para calcular o fator de expansão dos bounds baseado no tamanho
    const getBoundsPadFactor = (): number => {
      if (!map || !map.getContainer) {
        return 0.10;
      }
      
      const container = map.getContainer();
      const containerWidth = container?.clientWidth || 800;
      
      if (containerWidth < 640) {
        return 0.20; 
      } else if (containerWidth < 1024) {
        return 0.15; 
      } else {
        return 0.10; 
      }
    };

    const adjustMap = (invalidateSize = false) => {
      if (!map || !map.getContainer || !map.getContainer() || bairros.length === 0) {
        return;
      }

      try {
        if (invalidateSize) {
          map.invalidateSize();
        }

        setTimeout(() => {
          if (!map || !map.getContainer || !map.getContainer()) {
            return;
          }

          const bounds = L.latLngBounds(
            bairros.flatMap(bairro => 
              bairro.coordenadas.map(coord => [coord[0], coord[1]] as [number, number])
            )
          );

          const center = bounds.getCenter();
          
          map.setView(center, map.getZoom());

          const padFactor = getBoundsPadFactor();
          const expandedBounds = bounds.pad(padFactor);

          const padding = getResponsivePadding();

          map.fitBounds(expandedBounds, { 
            padding: padding,
            maxZoom: 18
          });
        }, invalidateSize ? 100 : 0);
      } catch (error) {
        console.error('Erro ao ajustar mapa:', error);
      }
    };

    const configureMap = () => {
      try {
        // Verifica se o mapa está totalmente inicializado
        if (!map || !map.getContainer || !map.getContainer()) {
          return;
        }

        adjustMap();

        const vilhenaBounds = L.latLngBounds(
          [-12.85, -60.25], // Sudoeste 
          [-12.60, -60.05]  // Nordeste
        );

        setTimeout(() => {
          try {
            if (!map || !map.getContainer || !map.getContainer()) {
              return;
            }

            map.once('moveend', () => {
              try {
                const vilhenaBounds = L.latLngBounds(
                  [-12.85, -60.25], // Sudoeste
                  [-12.60, -60.05]  // Nordeste
                );

                // Restringe o mapa aos bounds de Vilhena
                map.setMaxBounds(vilhenaBounds);
                
                // Define zoom fixo - não permite alteração
                const currentZoom = map.getZoom();
                map.setMinZoom(currentZoom);
                map.setMaxZoom(currentZoom);

                // Desabilita todas as interações de zoom e pan
                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.boxZoom.disable();
                map.keyboard.disable();
              } catch (err) {
                console.error('Erro ao finalizar configuração do mapa:', err);
              }
            });

            // Se o evento não disparar, tenta depois de um timeout
            setTimeout(() => {
              try {
                if (!map || !map.getContainer || !map.getContainer()) {
                  return;
                }

                const vilhenaBounds = L.latLngBounds(
                  [-12.85, -60.25],
                  [-12.60, -60.05]
                );

                map.setMaxBounds(vilhenaBounds);
                const currentZoom = map.getZoom();
                map.setMinZoom(currentZoom);
                map.setMaxZoom(currentZoom);

                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.boxZoom.disable();
                map.keyboard.disable();
              } catch (err) {
                console.error('Erro ao finalizar configuração do mapa (fallback):', err);
              }
            }, 500);
          } catch (err) {
            console.error('Erro ao configurar mapa:', err);
          }
        }, 300);
      } catch (error) {
        console.error('Erro ao configurar mapa:', error);
      }
    };

    // Aguarda o mapa estar pronto
    if (map.whenReady) {
      map.whenReady(configureMap);
    } else {
      // Fallback: usa setTimeout se whenReady não estiver disponível
      setTimeout(configureMap, 100);
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const handleResize = () => {
      if (map && bairros.length > 0) {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        // Usa debounce e invalida o tamanho do mapa para recalcular
        resizeTimeout = setTimeout(() => {
          adjustMap(true);
        }, 200);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [map, bairros]);

  return null;
}

export default function MapBairrosDemandasClient({ 
  demandasPorBairro, 
  kmlContent 
}: MapBairrosDemandasProps) {
  const [bairros, setBairros] = useState<ReturnType<typeof extractBairrosFromGeoJSON>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultCenter: [number, number] = [-12.7361, -60.1461];
  const defaultZoom = 13;
  
  // Bounds aproximados de Vilhena para limitar a visualização
  const vilhenaBounds: [[number, number], [number, number]] = [
    [-12.85, -60.25], // Sudoeste
    [-12.60, -60.05]  // Nordeste
  ];

  useEffect(() => {
    async function loadKML() {
      try {
        setLoading(true);
        setError(null);

        // Se não foi passado conteúdo KML, tenta carregar do arquivo
        let kmlData = kmlContent;
        
        if (!kmlData) {
          const response = await fetch('/Bairros de Vilhena.kml');
          if (!response.ok) {
            throw new Error('Erro ao carregar arquivo KML');
          }
          kmlData = await response.text();
        }

        // Parseia KML para GeoJSON
        const geoJSON = parseKMLToGeoJSON(kmlData);
        
        // Extrai bairros com dados de demanda
        const bairrosData = extractBairrosFromGeoJSON(geoJSON, demandasPorBairro);
        
        setBairros(bairrosData);
      } catch (err) {
        console.error('Erro ao processar KML:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar mapa');
      } finally {
        setLoading(false);
      }
    }

    loadKML();
  }, [demandasPorBairro, kmlContent]);

  const coresPaleta = useMemo(() => {
    return [
      '#3b82f6', 
      '#10b981', 
      '#f59e0b', 
      '#ef4444', 
      '#8b5cf6', 
      '#06b6d4', 
      '#f97316', 
      '#ec4899', 
      '#14b8a6', 
      '#6366f1', 
      '#84cc16', 
      '#f43f5e', 
      '#0ea5e9', 
      '#a855f7', 
      '#22c55e', 
      '#eab308', 
      '#fb923c', 
      '#64748b', 
      '#06b6d4', 
      '#9333ea', 
    ];
  }, []);

  // Gera uma cor única para cada bairro baseado no índice
  const getBairroColor = (index: number): string => {
    const corIndex = index % coresPaleta.length;
    return coresPaleta[corIndex];
  };

  const getPolygonOpacity = (quantidade: number, maxQuantidade: number) => {
    if (quantidade === 0) return 0.3; 
    
    const normalized = Math.min(quantidade / maxQuantidade, 1);
    return 0.4 + (normalized * 0.4); 
  };

  const maxQuantidade = useMemo(() => {
    return Math.max(...demandasPorBairro.map(d => d.quantidade), 1);
  }, [demandasPorBairro]);

  if (loading) {
    return (
      <div className="w-full h-[600px] rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-global-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] rounded-lg border border-gray-200 flex items-center justify-center bg-red-50">
        <div className="text-center text-red-600">
          <p className="font-semibold">Erro ao carregar mapa</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={defaultZoom}
        maxZoom={defaultZoom}
        maxBounds={vilhenaBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', backgroundColor: '#f9fafb' }}
        scrollWheelZoom={false}
        zoomControl={false}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        {/* Removido TileLayer - mostra apenas os polígonos */}
        <MapController bairros={bairros} />
        
        {bairros.map((bairro, index) => {
          const quantidade = bairro.feature.properties?.quantidade || 0;
          const cor = getBairroColor(index);
          const opacity = getPolygonOpacity(quantidade, maxQuantidade);
          
          return (
            <Polygon
              key={`${bairro.nome}-${index}`}
              positions={bairro.coordenadas}
              pathOptions={{
                color: cor,
                fillColor: cor,
                fillOpacity: opacity,
                weight: 2.5,
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-2">{bairro.nome}</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Demandas: </span>
                    <span className="text-global-accent font-bold">{quantidade}</span>
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}

