import type { ComponentType } from 'react';

export interface MapBairrosDemandasClientProps {
  demandasPorBairro: Array<{
    bairro: string;
    quantidade: number;
    cor?: string;
  }>;
  kmlContent?: string;
}

declare const MapBairrosDemandasClient: ComponentType<MapBairrosDemandasClientProps>;
export default MapBairrosDemandasClient;

