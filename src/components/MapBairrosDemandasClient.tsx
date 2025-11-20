"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { MapContainer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseKMLToGeoJSON, extractBairrosFromGeoJSON } from '@/lib/kmlParser';
import type { BairroData } from '@/lib/kmlParser';
import type { DemandaPorBairro } from '@/types/admin';
import type { Demanda } from '@/types/demanda';
import { ClickablePolygonWrapper } from './ClickablePolygonWrapper';
import { MapController } from './MapController';

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
  demandas?: Demanda[];
  onBairroSelect?: (bairro: BairroSelecionado | null) => void;
}

export interface BairroSelecionado {
  nome: string;
  coordenadas: [number, number][];
  cor: string;
}

export default function MapBairrosDemandasClient({ 
  demandasPorBairro, 
  kmlContent,
  demandas = [],
  onBairroSelect
}: MapBairrosDemandasProps) {
  const [bairros, setBairros] = useState<ReturnType<typeof extractBairrosFromGeoJSON>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSelected = useRef(false);

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

  // Pré-seleciona o bairro com mais demandas quando os dados carregam
  useEffect(() => {
    if (!loading && bairros.length > 0 && !hasAutoSelected.current && onBairroSelect) {
      const bairroComMaisDemandas = bairros.reduce((prev, current) => {
        const prevQuantidade = prev.feature.properties?.quantidade || 0;
        const currentQuantidade = current.feature.properties?.quantidade || 0;
        return currentQuantidade > prevQuantidade ? current : prev;
      });

      if ((bairroComMaisDemandas.feature.properties?.quantidade || 0) > 0) {
        const index = bairros.indexOf(bairroComMaisDemandas);
        const corIndex = index % coresPaleta.length;
        const cor = coresPaleta[corIndex];
        const bairroSelecionado: BairroSelecionado = {
          nome: bairroComMaisDemandas.nome,
          coordenadas: bairroComMaisDemandas.coordenadas,
          cor
        };
        onBairroSelect(bairroSelecionado);
        hasAutoSelected.current = true;
      } else if (bairros.length > 0) {
        const primeiroBairro = bairros[0];
        const cor = coresPaleta[0];
        const bairroSelecionado: BairroSelecionado = {
          nome: primeiroBairro.nome,
          coordenadas: primeiroBairro.coordenadas,
          cor
        };
        onBairroSelect(bairroSelecionado);
        hasAutoSelected.current = true;
      }
    }
  }, [loading, bairros, onBairroSelect, coresPaleta]);

  const getPolygonOpacity = (quantidade: number, maxQuantidade: number) => {
    if (quantidade === 0) return 0.3; 
    
    const normalized = Math.min(quantidade / maxQuantidade, 1);
    return 0.4 + (normalized * 0.4); 
  };

  const maxQuantidade = useMemo(() => {
    return Math.max(...demandasPorBairro.map(d => d.quantidade), 1);
  }, [demandasPorBairro]);


  const handleBairroClick = useCallback((bairro: BairroData, index: number) => {
    const corIndex = index % coresPaleta.length;
    const cor = coresPaleta[corIndex];
    const bairroSelecionado: BairroSelecionado = {
      nome: bairro.nome,
      coordenadas: bairro.coordenadas,
      cor
    };
    onBairroSelect?.(bairroSelecionado);
  }, [onBairroSelect, coresPaleta]);

  // Reseta o flag de pré-seleção quando o componente é desmontado
  useEffect(() => {
    return () => {
      hasAutoSelected.current = false;
    };
  }, []);

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
        key={`map-${bairros.length}`}
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
        {/*mostra apenas os polígonos */}
        <MapController bairros={bairros} />
        
        {bairros.map((bairro, index) => {
          const quantidade = bairro.feature.properties?.quantidade || 0;
          const cor = getBairroColor(index);
          const opacity = getPolygonOpacity(quantidade, maxQuantidade);
          
          return (
            <ClickablePolygonWrapper
              key={`${bairro.nome}-${index}`}
              bairro={bairro}
              index={index}
              cor={cor}
              opacity={opacity}
              onBairroClick={handleBairroClick}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

