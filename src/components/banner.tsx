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

export default function Banner({
  titulo,
  descricao,
  icone,
  className,
  backgroundColor
}: BannerProps) {
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
        <div className="absolute top-32 left-32 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12"></div>
        <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-white/20 rounded-full"></div>

        {/* Conteúdo do banner */}
        <div className="relative z-10 h-full flex items-center px-6 sm:px-6 lg:px-40 pt-8 pb-20 md:pt-10 md:pb-28 lg:pt-12 lg:pb-32">
          <div className="flex items-center gap-6 md:gap-10 w-full">
            {/* Ícone circular - maior e mais elegante */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-2xl border-4 border-white/20">
              {icone ? (
                typeof icone === 'string' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={icone}
                    alt="Ícone do serviço"
                    className="w-14 h-14 md:w-18 md:h-18 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  React.createElement(icone, {
                    className: "w-14 h-14 md:w-20 md:h-20",
                    style: { color: 'var(--global-accent)' }
                  })
                )
              ) : (
                <div className="w-14 h-14 md:w-18 md:h-18 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Título e descrição */}
            <div className="flex-1 space-y-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight tracking-wide">
                {titulo}
              </h1>
              {descricao && (
                <p className="text-sm md:text-base lg:text-lg text-white/85 leading-relaxed max-w-4xl font-light tracking-wide">
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

