// src/app/(auth)/perfil/page.tsx

'use client';

import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PerfilPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-test="loading-perfil">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gray-50" data-test="page-perfil"> 
      <div className="hidden lg:flex relative w-[54%] items-center justify-center p-12 overflow-hidden min-h-screen" style={{ backgroundColor: 'var(--global-accent)' }}>
        {/* Padrão de pontos e formas geométricas */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="white"/>
                <circle cx="0" cy="0" r="1" fill="white"/>
                <circle cx="60" cy="0" r="1" fill="white"/>
                <circle cx="0" cy="60" r="1" fill="white"/>
                <circle cx="60" cy="60" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)"/>
          </svg>
        </div>
        
        {/* Formas geométricas decorativas */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
          <p className="text-lg text-white/90">
            Foto de perfil
          </p>
        </div>
      </div>

      {/* Container do Perfil */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 py-8 lg:py-0">
        <div className="bg-white rounded-lg shadow-lg p-8" data-test="perfil-container">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900" data-test="perfil-titulo">
              Meu Perfil
            </h1>
          </div>

          <div className="border-t border-gray-200 pt-6" data-test="perfil-info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-test="perfil-campo-nome">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.nome || 'Não informado'}</p>
                </div>
              </div>

              <div data-test="perfil-campo-cpf">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.cpf || 'Não informado'}</p>
                </div>
              </div>

              <div data-test="perfil-campo-email">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.email || 'Não informado'}</p>
                </div>
              </div>
              
              <div data-test="perfil-campo-data-nascimento">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.data_nascimento || 'Não informado'}</p>
                </div>
              </div>

              <div data-test="perfil-campo-tipo">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 capitalize">
                    {user?.nivel_acesso?.administrador ? 'Administrador' :
                     user?.nivel_acesso?.secretario ? 'Secretário' :
                     user?.nivel_acesso?.operador ? 'Operador' :
                     user?.nivel_acesso?.municipe ? 'Munícipe' : 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="col-span-2" data-test="perfil-campo-endereco">
                <Separator className="my-2" />
                Endereço
              </div>

              <div data-test="perfil-campo-cep">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.cep || 'Não informado'}</p>
                </div>
              </div>

              <div data-test="perfil-campo-rua">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.rua || 'Não informado'}</p>
                </div>
              </div>
            
              <div data-test="perfil-campo-cpf">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.numero || 'Não informado'}</p>
                </div>
              </div>

              <div data-test="perfil-campo-complemento">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.complemento || 'Não informado'}</p>
                </div>
              </div>
              
              <div data-test="perfil-campo-cidade">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.cidade || 'Não informado'}</p>
                </div>
              </div>

              <div data-test="perfil-campo-estado">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.estado || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6" data-test="perfil-acoes">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ações da Conta
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-6 py-3 bg-global-accent/90 text-white rounded-lg hover:bg-global-accent-hover transition-colors"
                data-test="button-editar-perfil"
              >
                Editar Perfil
              </button>
              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                data-test="button-sair"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
    </div>
  </div>
  );
}
