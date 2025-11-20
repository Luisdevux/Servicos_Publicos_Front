"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  bairros: Array<{ coordenadas: [number, number][] }>;
}

export function MapController({ bairros }: MapControllerProps) {
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
      } 
      else if (containerWidth < 700){
        return [30, 20];
      }
      else if (containerWidth >= 480 && containerWidth <= 520) {
        return [50, 50];
      }
      else if (containerWidth < 1024) {
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
      } else if (containerWidth < 700){
        return 0.05;
      } else if (containerWidth >= 480 && containerWidth <= 520) {
        return 0.08;
      } else if (containerWidth < 1024) {
        return 0.10 ; 
      } else {
        return 0.05; 
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

