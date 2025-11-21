'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AguardandoVerificacaoContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'seu email';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--global-accent)' }}>
      {/* Padrão de pontos e formas geométricas */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="aguardando-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="white"/>
              <circle cx="0" cy="0" r="1" fill="white"/>
              <circle cx="60" cy="0" r="1" fill="white"/>
              <circle cx="0" cy="60" r="1" fill="white"/>
              <circle cx="60" cy="60" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aguardando-grid)"/>
        </svg>
      </div>
      
      {/* Formas geométricas decorativas */}
      <div className="absolute top-20 left-20 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12"></div>
      <div className="absolute bottom-20 right-20 w-12 h-12 border-2 border-white/20 rounded-full"></div>
      <div className="absolute top-1/2 right-40 w-8 h-8 border-2 border-white/10 rounded-lg -rotate-45"></div>
      <div className="absolute bottom-1/3 left-40 w-10 h-10 border-2 border-white/10 rounded-full"></div>
      
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 relative z-10">
        {/* Ícone e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-lg" style={{ backgroundColor: 'rgba(var(--global-accent-rgb, 44, 122, 155), 0.1)' }}>
              <Mail className="h-10 w-10" style={{ color: 'var(--global-accent)' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Cadastro Realizado!</h1>
          <p className="text-lg text-gray-600">Falta apenas um passo para começar</p>
        </div>

        {/* Instruções */}
        <div className="space-y-6 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-center text-gray-700">
              Enviamos um email de verificação para <strong className="font-semibold">{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Para concluir seu cadastro:</h2>
            
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--global-accent)' }}>
                1
              </div>
              <div>
                <h3 className="font-medium">Abra sua caixa de entrada</h3>
                <p className="text-sm text-gray-600">Verifique o email que enviamos para {email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--global-accent)' }}>
                2
              </div>
              <div>
                <h3 className="font-medium">Clique no link de verificação</h3>
                <p className="text-sm text-gray-600">O email contém um botão para verificar sua conta</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--global-accent)' }}>
                3
              </div>
              <div>
                <h3 className="font-medium">Faça seu primeiro login</h3>
                <p className="text-sm text-gray-600">Após verificar, você poderá acessar o sistema</p>
              </div>
            </div>
          </div>

          {/* Avisos */}
          <div className="border-l-4 pl-4 py-2" style={{ borderColor: 'var(--global-accent)' }}>
            <p className="text-sm text-gray-700">
              <strong>Não recebeu o email?</strong> Verifique sua pasta de spam ou lixo eletrônico.
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm text-gray-700">
              <strong>⏰ Atenção:</strong> O link de verificação expira em 24 horas.
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/login/municipe" className="flex-1">
            <Button className="w-full text-white" style={{ backgroundColor: 'var(--global-accent)' }}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Ir para Login
            </Button>
          </Link>
          
          <Link href="/cadastro" className="flex-1">
            <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              <RefreshCw className="mr-2 h-4 w-4" />
              Fazer Novo Cadastro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AguardandoVerificacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--global-accent)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4 text-white">Carregando...</p>
        </div>
      </div>
    }>
      <AguardandoVerificacaoContent />
    </Suspense>
  );
}
