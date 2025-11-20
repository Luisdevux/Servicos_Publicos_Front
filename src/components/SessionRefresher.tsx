'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Componente que mantém a sessão ativa e força renovação de token
 * Faz polling silencioso de /api/auth/session para triggerar o JWT callback
 */
export function SessionRefresher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    // Faz polling silencioso a cada 5 minutos (mesmo intervalo do updateAge)
    const interval = setInterval(async () => {
      try {
        // Chama /api/auth/session silenciosamente (não recarrega a página)
        await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store',
        });
      } catch (error) {
        // Ignora erros silenciosamente
        console.debug('[SessionRefresher] Erro ao atualizar sessão:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [session]);

  return null; // Componente invisível
}
