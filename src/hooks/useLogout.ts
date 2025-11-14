// src/hooks/useLogout.ts

"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "sonner";

// Hook para fazer logout completo 

export function useLogout() {
  const { data: session } = useSession();

  const logout = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    // Determina a URL de callback baseado no nível de acesso do usuário
    const user = session?.user;
    let callbackUrl = '/login/municipe'; // Default para munícipe
    
    if (user?.nivel_acesso) {
      if (user.nivel_acesso.administrador) {
        callbackUrl = '/login/funcionario';
      } else if (user.nivel_acesso.secretario) {
        callbackUrl = '/login/funcionario';
      } else if (user.nivel_acesso.operador) {
        callbackUrl = '/login/funcionario';
      }
    }

    try {
      // Chama a API de logout do backend através da rota segura
      try {
        const response = await fetch('/api/auth/secure-fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: '/logout',
            method: 'POST'
          })
        });

        if (response.ok) {
          console.log('[useLogout] Logout na API executado com sucesso');
        } else {
          console.warn('[useLogout] Erro ao chamar logout da API:', response.status);
        }
      } catch (apiError) {
        console.error('[useLogout] Erro ao chamar logout da API:', apiError);
        // Continua com o logout local mesmo se a API falhar
      }

      // Limpa flags de "lembrar de mim"
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shouldRememberSession');
        sessionStorage.removeItem('activeSession');
      }

      // Faz signOut do NextAuth
      await signOut({
        callbackUrl,
        redirect: true
      });

      if (!silent) {
        toast.success("Logout realizado com sucesso!");
      }
    } catch (error) {
      console.error('[useLogout] Erro ao fazer logout:', error);

      if (!silent) {
        toast.error("Erro ao fazer logout. Redirecionando...");
      }

      // Força redirect mesmo com erro
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 1000);
    }
  }, [session]);

  return { logout };
}
