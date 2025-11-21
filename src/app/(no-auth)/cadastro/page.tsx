// src/app/(no-auth)/cadastro/page.tsx

"use client";

import Link from 'next/link';
import CadastroForm from '@/components/CadastroForm';
import SlideTransition from '@/components/SlideTransition';

export default function CadastroPage() {
  return (
    <SlideTransition direction="left" duration={600}>
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gray-50">
        {/* Painel Azul */}
        <div className="hidden lg:flex relative w-[54%] items-center justify-center p-12 overflow-hidden min-h-screen" style={{ backgroundColor: 'var(--global-accent)' }}>
          {/* Padrão de pontos e formas geométricas */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cadastro-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white"/>
                  <circle cx="0" cy="0" r="1" fill="white"/>
                  <circle cx="60" cy="0" r="1" fill="white"/>
                  <circle cx="0" cy="60" r="1" fill="white"/>
                  <circle cx="60" cy="60" r="1" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cadastro-grid)"/>
            </svg>
          </div>
          
          {/* Formas geométricas decorativas */}
          <div className="absolute top-32 left-32 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-white/20 rounded-full"></div>
          
          {/* Onda Divisória Vertical */}
          <div className="absolute -right-1 top-0 h-full w-32 pointer-events-none z-30">
            <svg 
              viewBox="0 0 120 1440" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path 
                d="M80 0L73.3 60C67 120 53 240 46.7 360C40 480 40 600 43.3 720C47 840 53 960 46.7 1080C40 1200 20 1320 10 1380L0 1440H120V1380C120 1320 120 1200 120 1080C120 960 120 840 120 720C120 600 120 480 120 360C120 240 120 120 120 60V0H80Z" 
                fill="#f9fafb"
              />
            </svg>
          </div>
          
          <div className="relative z-10 text-white text-center max-w-md">
            <h1 className="text-6xl font-bold mb-4">
              Vilhena+<br/>Pública
            </h1>
            <div className="w-24 h-1 bg-white mx-auto mb-6" />
            <p className="text-2xl font-medium mb-4">
              Sistema de Gestão de Serviços Públicos
            </p>
            <p className="text-lg text-white/90 mb-8">
              Cadastro de Munícipe
            </p>
            
            {/* Benefícios */}
            <div className="text-left space-y-4 mt-8">
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Acesso Rápido</h3>
                  <p className="text-white/70 text-sm">Acompanhe suas solicitações em tempo real</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Seguro e Confiável</h3>
                  <p className="text-white/70 text-sm">Seus dados protegidos com criptografia</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Disponível 24/7</h3>
                  <p className="text-white/70 text-sm">Faça suas solicitações a qualquer hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container do Formulário */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-20 py-8 lg:py-0">
          <div className="lg:hidden text-center mb-8 px-8" style={{ color: 'var(--global-accent)' }}>
            <h1 className="text-3xl font-bold mb-2">
              Vilhena+ Pública
            </h1>
            <p className="text-sm text-gray-600">
              Sistema de Gestão de Serviços Públicos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cadastro de Munícipe
            </p>
          </div>

          <div className="w-full max-w-2xl px-8">
            <CadastroForm />
            
            {/* Links de navegação */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-sm">
                Já possui cadastro?{' '}
                <Link 
                  href="/login/municipe" 
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--global-accent)' }}
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SlideTransition>
  );
}
