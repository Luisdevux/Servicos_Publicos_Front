// src/components/cardDemanda.tsx

import { Plus, ImageOff } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export interface CardDemandaProps {
  titulo: string;
  descricao: string;
  imagem: string;
  theme?: 'default' | 'green' | 'purple';
  onCreateClick?: () => void;
}

export default function CardDemanda({ titulo, descricao, imagem, theme = 'default', onCreateClick }: CardDemandaProps) {
  const themeClass = theme === 'green' ? 'global-theme-green' : theme === 'purple' ? 'global-theme-purple' : '';
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`w-full h-[400px] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:scale-105 transform flex flex-col ${themeClass}`} data-test="card-demanda-container">
      <div className="h-48 overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center" data-test="card-demanda-image-container">
        {imagem && !imageError ? (
          <img
            src={imagem}
            alt={titulo}
            className="w-full h-full object-cover"
            onError={handleImageError}
            data-test="card-demanda-image"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-slate-50 to-slate-100" data-test="card-demanda-no-image">
            <div className="w-16 h-16 mb-3 rounded-full bg-slate-200/80 flex items-center justify-center shadow-sm">
              <ImageOff className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 px-4 text-center" data-test="card-demanda-no-image-text">Nenhuma imagem disponível</p>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between h-[208px]" data-test="card-demanda-content">
        <div className="flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center line-clamp-2" data-test="card-demanda-titulo">
            {titulo}
          </h3>
          <p className="text-gray-600 text-sm text-center mb-3 line-clamp-4" data-test="card-demanda-descricao">
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