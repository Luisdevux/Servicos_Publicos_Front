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
          "relative w-full h-56 md:h-64 overflow-hidden",
          className
        )}
        style={{
          background: backgroundColor || 'linear-gradient(135deg, var(--global-accent) 0%, var(--global-text-primary) 100%)',
          minHeight: 220,
        }}
      >
        {/* Círculos decorativos */}
        <div className="absolute inset-0">
          {/* Círculo grande direita */}
          <div
            className="absolute -top-32 -right-20 w-80 h-80 md:w-96 md:h-96 rounded-full opacity-15"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.05) 70%, transparent 100%)`,
              animation: 'floatBig 15s ease-in-out infinite',
              filter: 'blur(1px)',
            }}
          />

          {/* Círculo médio superior */}
          <div
            className="absolute -top-16 right-1/4 w-48 h-48 md:w-64 md:h-64 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 80%, transparent 100%)`,
              animation: 'floatMedium 12s ease-in-out infinite 2s',
              filter: 'blur(0.8px)',
            }}
          />

          {/* Círculo pequeno superior centro */}
          <div
            className="absolute top-8 left-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-25"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 60%, transparent 100%)`,
              animation: 'floatSmall 8s ease-in-out infinite 1s',
              filter: 'blur(0.5px)',
            }}
          />

          {/* Círculo grande esquerda inferior */}
          <div
            className="absolute -bottom-40 -left-32 w-96 h-96 md:w-[500px] md:h-[500px] rounded-full opacity-12"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.03) 80%, transparent 100%)`,
              animation: 'floatLeft 18s ease-in-out infinite 3s',
              filter: 'blur(1.2px)',
            }}
          />

          {/* Círculo pequeno esquerda */}
          <div
            className="absolute top-12 left-16 w-16 h-16 md:w-20 md:h-20 rounded-full opacity-30"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
              animation: 'floatSmall2 6s ease-in-out infinite 0.5s',
              filter: 'blur(0.3px)',
            }}
          />

          {/* Círculo médio direita inferior */}
          <div
            className="absolute bottom-20 right-20 w-40 h-40 md:w-56 md:h-56 rounded-full opacity-18"
            style={{
              background: `radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0.03) 85%, transparent 100%)`,
              animation: 'floatMedium2 10s ease-in-out infinite 1.5s',
              filter: 'blur(0.7px)',
            }}
          />
        </div>

        {/* Conteúdo do banner */}
        <div className="relative z-10 h-full flex items-center px-6 sm:px-6 lg:px-40">
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

            {/* Título e descrição - melhor tipografia */}
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

        {/* CSS para animações - mais suaves e elegantes */}
        <style jsx>{`
          @keyframes floatBig {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
              opacity: 0.15;
            }
            25% { 
              transform: translateY(-15px) translateX(-20px) scale(1.05) rotate(0.5deg);
              opacity: 0.12;
            }
            50% { 
              transform: translateY(-25px) translateX(10px) scale(0.95) rotate(-0.5deg);
              opacity: 0.18;
            }
            75% { 
              transform: translateY(-8px) translateX(25px) scale(1.02) rotate(0.3deg);
              opacity: 0.14;
            }
          }
          
          @keyframes floatMedium {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
              opacity: 0.20;
            }
            33% { 
              transform: translateY(-20px) translateX(15px) scale(1.08) rotate(-1deg);
              opacity: 0.16;
            }
            66% { 
              transform: translateY(-30px) translateX(-8px) scale(0.92) rotate(0.8deg);
              opacity: 0.24;
            }
          }
          
          @keyframes floatSmall {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
              opacity: 0.25;
            }
            50% { 
              transform: translateY(-18px) translateX(-12px) scale(1.1) rotate(-1.5deg);
              opacity: 0.30;
            }
          }
          
          @keyframes floatLeft {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
              opacity: 0.12;
            }
            40% { 
              transform: translateY(-12px) translateX(18px) scale(1.03) rotate(0.8deg);
              opacity: 0.08;
            }
            80% { 
              transform: translateY(-4px) translateX(-12px) scale(0.97) rotate(-0.5deg);
              opacity: 0.15;
            }
          }
          
          @keyframes floatSmall2 {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
              opacity: 0.30;
            }
            50% { 
              transform: translateY(-12px) translateX(8px) scale(1.15) rotate(1.2deg);
              opacity: 0.35;
            }
          }
          
          @keyframes floatMedium2 {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
              opacity: 0.18;
            }
            45% { 
              transform: translateY(-14px) translateX(-15px) scale(1.04) rotate(-0.7deg);
              opacity: 0.14;
            }
            90% { 
              transform: translateY(-22px) translateX(6px) scale(0.96) rotate(1deg);
              opacity: 0.22;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

