// src/components/banner.tsx

"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface BannerProps {
  titulo: string;
  descricao?: string;
  icone?: string | LucideIcon;
  className?: string;
  backgroundColor?: string;
}

// Mapeamento de tipos para ícones
const ICONE_POR_TIPO: Record<string, string> = {
  'Árvores': '/homeIconeArvores.svg',
  'Arvores': '/homeIconeArvores.svg',
  'Coleta': '/homeIconeColeta.svg',
  'Coleta de Lixo': '/homeIconeColeta.svg',
  'Animais': '/homeIconeDog.svg',
  'Animal': '/homeIconeDog.svg',
  'Iluminação': '/homeIconeIluminacao.svg',
  'Iluminacao': '/homeIconeIluminacao.svg',
  'Iluminação Pública': '/homeIconeIluminacao.svg',
  'Pavimento': '/homeIconePavimento.svg',
  'Pavimentação': '/homeIconePavimento.svg',
  'Asfaltamento': '/homeIconePavimento.svg',
  'Saneamento': '/homeIconeSaneamento.svg',
};

// Função para obter o ícone baseado no título
function obterIconePorTitulo(titulo: string): string {
  // Primeiro, tenta match exato
  if (ICONE_POR_TIPO[titulo]) {
    return ICONE_POR_TIPO[titulo];
  }
  
  // Depois, tenta match parcial (case insensitive)
  const tituloLower = titulo.toLowerCase();
  for (const [tipo, icone] of Object.entries(ICONE_POR_TIPO)) {
    if (tituloLower.includes(tipo.toLowerCase())) {
      return icone;
    }
  }
  
  // Fallback padrão
  return '/trash-icon.svg';
}

export default function Banner({
  titulo,
  descricao,
  icone,
  className,
  backgroundColor
}: BannerProps) {
  // Se não for fornecido um ícone, tenta determinar pelo título
  const iconeUrl = icone || obterIconePorTitulo(titulo);
  
  return (
    <div className="w-full">
      {/* Banner principal */}
      <div
        className={cn(
          "relative w-full min-h-[40vh] h-64 md:h-80 lg:h-96 overflow-hidden",
          className
        )}
        style={{
          background: backgroundColor || 'linear-gradient(135deg, var(--global-accent) 0%, var(--global-text-primary) 100%)',
        }}
      >
        {/* Grid de pontos */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="banner-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white"/>
                <circle cx="0" cy="0" r="1" fill="white"/>
                <circle cx="60" cy="0" r="1" fill="white"/>
                <circle cx="0" cy="60" r="1" fill="white"/>
                <circle cx="60" cy="60" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#banner-grid)"/>
          </svg>
        </div>

        {/* Elementos decorativos */}
        <div className="hidden sm:block absolute top-32 left-32 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-white/20 rounded-full"></div>

        {/* Conteúdo do banner */}
        <div className="relative z-10 h-full flex items-center px-4 sm:px-6 lg:px-40 pt-6 pb-16 md:pt-10 md:pb-28 lg:pt-12 lg:pb-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-10 w-full">
            {/* Ícone circular - maior e mais elegante */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shrink-0 shadow-2xl border-4 border-white/20">
              {typeof iconeUrl === 'string' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconeUrl}
                  alt="Ícone do serviço"
                  className="w-10 h-10 sm:w-14 sm:h-14 md:w-18 md:h-18 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                React.createElement(iconeUrl as LucideIcon, {
                  className: "w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20",
                  style: { color: 'var(--global-text-primary)' }
                })
              )}
            </div>

            {/* Título e descrição */}
            <div className="flex-1 space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight tracking-wide">
                {titulo}
              </h1>
              {descricao && (
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/85 leading-relaxed max-w-4xl font-light tracking-wide line-clamp-3 sm:line-clamp-none">
                  {descricao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto relative z-10" style={{ transform: 'translateY(1px)' }}>
          {/* Aqui é onde adiciona a curvatura */}
          <path d="M0 80 H1440 V120 H0 Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
}