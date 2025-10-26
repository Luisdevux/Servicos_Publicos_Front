// src/app/(auth)/perfil/page.tsx

'use client';

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
    <div className="min-h-screen bg-gray-50" data-test="page-perfil"> 
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

              <div data-test="perfil-campo-email">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{user?.email || 'Não informado'}</p>
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

              <div data-test="perfil-campo-id">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Usuário
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-mono text-sm">
                    {user?.id || 'Não informado'}
                  </p>
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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                data-test="button-editar-perfil"
              >
                Editar Perfil
              </button>
              <button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                data-test="button-alterar-senha"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
