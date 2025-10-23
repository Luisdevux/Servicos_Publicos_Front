// src/app/login/funcionario/page.tsx

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import LoginFuncionarioForm from '@/components/LoginFuncionarioForm';

export const metadata: Metadata = {
  title: 'Login - Funcionário | Vilhena+Pública',
  description: 'Acesse sua conta como funcionário da prefeitura',
};

function LoginFuncionarioContent() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gray-50">
      <div className="hidden lg:flex relative w-[54%] items-center justify-center p-12 overflow-hidden min-h-screen" style={{ backgroundColor: 'var(--global-accent)' }}>
        {/* Círculos decorativos */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute bottom-32 left-32 w-48 h-48 rounded-full bg-white/15" />
        <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-20 w-56 h-56 rounded-full bg-white/10" />
        
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
          <p className="text-lg text-white/90">
            Acesso para Funcionários
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
            Sistema de Gestão de Serviços Públicos
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Acesso para Funcionários
          </p>
        </div>

        <div className="w-full max-w-md px-8">
          <LoginFuncionarioForm />
          
          {/* Link para login de munícipe */}
          <div className="mt-6 text-center">
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
    </div>
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
