// src/components/SessionWrapper.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import { SessionErrorHandler } from "./SessionErrorHandler";

/**
 * SessionWrapper com suporte a "lembrar de mim"
 * 
 * Comportamento controlado por cookies:
 * - Se lembrarDeMim = false: Cookie SEM maxAge (session cookie - expira ao fechar navegador)
 * - Se lembrarDeMim = true: Cookie COM maxAge de 30 dias (persistent cookie)
 * 
 * A configuração do cookie é feita pela rota /api/auth/set-session-cookie
 * após o login bem-sucedido.
 */
export function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
      <SessionErrorHandler />
      {children}
    </SessionProvider>
  );
}
