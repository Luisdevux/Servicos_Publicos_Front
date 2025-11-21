"use client";

import { useEffect } from 'react';
import { Polygon, useMap } from 'react-leaflet';
import type { BairroData } from '@/lib/kmlParser';

// Variável global para garantir que o estilo seja adicionado apenas uma vez
let styleAdded = false;

interface ClickablePolygonWrapperProps {
  bairro: BairroData;
  index: number;
  cor: string;
  opacity: number;
  onBairroClick: (bairro: BairroData, index: number) => void;
}

// Componente para garantir que os polígonos sejam sempre clicáveis
export function ClickablePolygonWrapper({ 
  bairro, 
  index, 
  cor, 
  opacity, 
  onBairroClick 
}: ClickablePolygonWrapperProps) {
  const map = useMap();

  useEffect(() => {
    // Garante que o mapa permita interações nos polígonos mesmo quando está desabilitado
    if (map && !styleAdded) {
      // Força o cursor pointer nos elementos do polígono
      const style = document.createElement('style');
      style.id = 'polygon-pointer-style';
      style.textContent = `
        .leaflet-interactive {
          cursor: pointer !important;
        }
        .leaflet-clickable {
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(style);
      styleAdded = true;
    }
  }, [map]);

  return (
    <Polygon
      key={`${bairro.nome}-${index}`}
      positions={bairro.coordenadas}
      pathOptions={{
        color: cor,
        fillColor: cor,
        fillOpacity: opacity,
        weight: 2.5,
        interactive: true,
      }}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation();
          onBairroClick(bairro, index);
        },
        mouseover: () => {
          if (map && map.getContainer) {
            map.getContainer().style.cursor = 'pointer';
          }
        },
        mouseout: () => {
          if (map && map.getContainer) {
            map.getContainer().style.cursor = '';
          }
        },
      }}
    />
  );
}

