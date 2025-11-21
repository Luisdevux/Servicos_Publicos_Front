"use client";

import dynamic from 'next/dynamic';
import type { DemandaPorBairro } from '@/types/admin';
import type { Demanda } from '@/types/demanda';
import type { BairroSelecionado } from './MapBairrosDemandasClient';

interface MapBairrosDemandasProps {
  demandasPorBairro: DemandaPorBairro[];
  kmlContent?: string;
  demandas?: Demanda[];
  onBairroSelect?: (bairro: BairroSelecionado | null) => void;
}

// Importação dinâmica para evitar problemas de SSR com Leaflet
const MapClient = dynamic<MapBairrosDemandasProps>(
  () => import('./MapBairrosDemandasClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[800px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-global-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    ),
  }
);

export default function MapBairrosDemandas({ demandasPorBairro, kmlContent, demandas, onBairroSelect }: MapBairrosDemandasProps) {
  return <MapClient demandasPorBairro={demandasPorBairro} kmlContent={kmlContent} demandas={demandas} onBairroSelect={onBairroSelect} />;
}
