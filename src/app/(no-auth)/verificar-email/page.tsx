'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verificarEmail } from '@/services/authService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerificarEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando seu email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    verificarEmail(token)
      .then((response) => {
        setStatus('success');
        setMessage(response.message || 'Email verificado com sucesso!');
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login/municipe');
        }, 3000);
      })
      .catch((error: unknown) => {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro ao verificar email. Tente novamente.');
        console.error('Erro na verificação:', error);
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--global-accent)' }}>
      {/* Padrão de pontos e formas geométricas */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="verify-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="white"/>
              <circle cx="0" cy="0" r="1" fill="white"/>
              <circle cx="60" cy="0" r="1" fill="white"/>
              <circle cx="0" cy="60" r="1" fill="white"/>
              <circle cx="60" cy="60" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#verify-grid)"/>
        </svg>
      </div>
      
      {/* Formas geométricas decorativas */}
      <div className="absolute top-20 left-20 w-16 h-16 border-2 border-white/20 rounded-lg rotate-12"></div>
      <div className="absolute bottom-20 right-20 w-12 h-12 border-2 border-white/20 rounded-full"></div>
      <div className="absolute top-1/2 right-40 w-8 h-8 border-2 border-white/10 rounded-lg -rotate-45"></div>
      <div className="absolute bottom-1/3 left-40 w-10 h-10 border-2 border-white/10 rounded-full"></div>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Verificação de Email</h1>
          <p className="text-sm text-gray-600">
            {status === 'loading' && 'Aguarde enquanto verificamos seu email...'}
            {status === 'success' && 'Seu email foi verificado!'}
            {status === 'error' && 'Ocorreu um problema'}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 animate-spin" style={{ color: 'var(--global-accent)' }} />
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-600" />
          )}
          
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-red-600" />
          )}

          <p className="text-center text-sm text-gray-600">
            {message}
          </p>

          {status === 'success' && (
            <p className="text-center text-xs text-gray-500">
              Você será redirecionado para a página de login em instantes...
            </p>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-2 w-full">
              <Button 
                onClick={() => router.push('/login/municipe')}
                className="w-full"
              >
                Ir para Login
              </Button>
              <Button 
                onClick={() => router.push('/cadastro')}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Voltar para Cadastro
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--global-accent)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4 text-white">Carregando...</p>
        </div>
      </div>
    }>
      <VerificarEmailContent />
    </Suspense>
  );
}
