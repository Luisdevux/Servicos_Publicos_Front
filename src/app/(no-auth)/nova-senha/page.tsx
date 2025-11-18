// src/app/(no-auth)/nova-senha/page.tsx

"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NovaSenhaForm from '@/components/NovaSenhaForm';
import SlideTransition from '@/components/SlideTransition';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function NovaSenhaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50" data-test="alerta-token-ausente">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Link inválido</strong>
              <br />
              O link de recuperação está incompleto ou inválido.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Link 
              href="/esqueci-senha" 
              className="font-semibold hover:underline transition-colors"
              style={{ color: 'var(--global-accent)' }}
              data-test="link-solicitar-novamente"
            >
              Solicitar novo link de recuperação
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SlideTransition direction="left" duration={600}>
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gray-50">
        {/* Painel Azul */}
        <div className="hidden lg:flex relative w-[54%] items-center justify-center p-12 overflow-hidden min-h-screen" style={{ backgroundColor: 'var(--global-accent)' }}>
          {/* Padrão de pontos e formas geométricas */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="reset-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white"/>
                  <circle cx="0" cy="0" r="1" fill="white"/>
                  <circle cx="60" cy="0" r="1" fill="white"/>
                  <circle cx="0" cy="60" r="1" fill="white"/>
                  <circle cx="60" cy="60" r="1" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#reset-grid)"/>
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
              Nova Senha
            </p>
            <p className="text-lg text-white/90">
              Crie uma senha forte para proteger sua conta
            </p>
          </div>
        </div>

        {/* Container do Formulário */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-20 py-8 lg:py-0">
          <div className="lg:hidden text-center mb-8 px-8" style={{ color: 'var(--global-accent)' }}>
            <h1 className="text-3xl font-bold mb-2">
              Vilhena+ Pública
            </h1>
            <p className="text-sm text-gray-600">
              Definir Nova Senha
            </p>
          </div>

          <div className="w-full max-w-md px-8">
            <NovaSenhaForm token={token} />
            
            {/* Links de navegação */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-sm">
                <Link 
                  href="/login/municipe" 
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--global-accent)' }}
                  data-test="link-voltar-login"
                >
                  ← Voltar para o login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SlideTransition>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#337695] mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <NovaSenhaContent />
    </Suspense>
  );
}
