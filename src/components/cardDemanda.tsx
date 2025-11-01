// src/components/cardDemanda.tsx

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { OptimizedImage } from "./OptimizedImage";

export interface CardDemandaProps {
  titulo: string;
  descricao: string;
  imagem: string;
  theme?: 'default' | 'green' | 'purple';
  onCreateClick?: () => void;
}

export default function CardDemanda({ titulo, descricao, imagem, theme = 'default', onCreateClick }: CardDemandaProps) {
  const themeClass = theme === 'green' ? 'global-theme-green' : theme === 'purple' ? 'global-theme-purple' : '';

  return (
    <div className={`w-full h-[400px] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:scale-105 transform flex flex-col ${themeClass}`} data-test="card-demanda-container">
      <div className="h-48 overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center relative" data-test="card-demanda-image-container">
        <OptimizedImage
          src={imagem}
          alt={titulo}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          quality={85}
          showLoader={true}
        />
      </div>
      <div className="p-4 flex flex-col justify-between h-[208px] min-h-0" data-test="card-demanda-content">
        <div className="flex flex-col flex-1 min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center line-clamp-2" data-test="card-demanda-titulo">
            {titulo}
          </h3>
          <p className="text-gray-600 text-sm text-center mb-3 line-clamp-4 overflow-hidden wrap-break-word" data-test="card-demanda-descricao">
            {descricao}
          </p>
        </div>
        <Button
          size="lg"
          colorClass="w-full font-medium py-2 px-3 bg-[var(--global-text-primary)] text-[var(--global-bg)] hover:bg-[var(--global-text-secondary)]"
          onClick={onCreateClick}
          data-test="card-demanda-botao-criar"
        >
          <Plus className="w-4 h-4" />
          Criar demanda
        </Button>
      </div>
    </div>
  );
}