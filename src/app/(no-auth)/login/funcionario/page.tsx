// src/app/(no-auth)/login/funcionario/page.tsx

"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import LoginFuncionarioForm from '@/components/LoginFuncionarioForm';
import SlideTransition from '@/components/SlideTransition';

function LoginFuncionarioContent() {
  return (
    <SlideTransition direction="right" duration={600}>
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gray-50">
        <div className="flex-1 flex flex-col items-center justify-center relative z-20 py-8 lg:py-0">
          <div className="lg:hidden text-center mb-8 px-8" style={{ color: 'var(--global-accent)' }}>
            <h1 className="text-3xl font-bold mb-2">
              Vilhena+ Pública
            </h1>
            <p className="text-sm text-gray-600">
              Sistema de Gestão de Serviços Públicos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Acesso para Funcionários
            </p>
          </div>

          <div className="w-full max-w-md px-8">
            <LoginFuncionarioForm />
            
            {/* Links de navegação */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-sm">
                <Link 
                  href="/" 
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--global-accent)' }}
                >
                  ← Voltar à tela inicial
                </Link>
              </p>
              <p className="text-gray-600 text-sm">
                É munícipe?{' '}
                <Link 
                  href="/login/municipe" 
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--global-accent)' }}
                >
                  Clique aqui
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Painel Azul */}
        <div className="hidden lg:flex relative w-[54%] items-center justify-center p-12 overflow-hidden min-h-screen" style={{ backgroundColor: 'var(--global-accent)' }}>
          {/* Padrão de pontos e formas geométricas */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="login-funcionario-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white"/>
                  <circle cx="0" cy="0" r="1" fill="white"/>
                  <circle cx="60" cy="0" r="1" fill="white"/>
                  <circle cx="0" cy="60" r="1" fill="white"/>
                  <circle cx="60" cy="60" r="1" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#login-funcionario-grid)"/>
            </svg>
          </div>
          
          {/* Formas geométricas decorativas */}
          <div className="absolute top-32 left-32 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12 animate-pulse"></div>
          <div className="absolute bottom-40 right-40 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Onda Divisória Vertical */}
          <div className="absolute -left-1 top-0 h-full w-32 pointer-events-none z-30">
            <svg 
              viewBox="0 0 120 1440" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path 
                d="M40 0L46.7 60C53 120 67 240 73.3 360C80 480 80 600 76.7 720C73 840 67 960 73.3 1080C80 1200 100 1320 110 1380L120 1440H0V1380C0 1320 0 1200 0 1080C0 960 0 840 0 720C0 600 0 480 0 360C0 240 0 120 0 60V0H40Z" 
                fill="#f9fafb"
                className="drop-shadow-2xl"
              />
            </svg>
          </div>
          
          <div className="relative z-10 text-white text-center max-w-md">
            <h1 className="text-6xl font-bold mb-4 animate-fade-in">
              Vilhena+<br/>Pública
            </h1>
            <div className="w-24 h-1 bg-white mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }} />
            <p className="text-2xl font-medium mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Sistema de Gestão de Serviços Públicos
            </p>
            <p className="text-lg text-white/90 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Acesso para Funcionários
            </p>
        </div>
      </div>
    </div>
    </SlideTransition>
  );
}

export default function LoginFuncionarioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#337695] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <LoginFuncionarioContent />
    </Suspense>
  );
}
