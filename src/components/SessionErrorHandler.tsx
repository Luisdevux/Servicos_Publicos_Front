// src/components/SessionErrorHandler.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLogout } from "@/hooks/useLogout";

/**
 * Componente que monitora erros na sessão e faz logout automático
 * quando o refresh token expira ou há erro de autenticação
 */
export function SessionErrorHandler() {
  const { data: session } = useSession();
  const { logout } = useLogout();

  useEffect(() => {
    // Verifica se há erro na sessão
    const sessionWithError = session as typeof session & { error?: string };

    if (sessionWithError?.error === "RefreshAccessTokenError") {

      console.error('[SessionErrorHandler] Erro no refresh token, fazendo logout...');
      toast.error("Sua sessão expirou. Por favor, faça login novamente.");

      // Aguarda um pouco para o toast ser exibido antes de fazer logout
      setTimeout(() => {
        logout({ silent: true });
      }, 1500);
    }
  }, [session, logout]);

  return null;
}
