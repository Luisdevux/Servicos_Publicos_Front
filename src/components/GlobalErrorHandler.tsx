// src/components/GlobalErrorHandler.tsx

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

/**
 * Componente global que monitora todos os erros de queries/mutations
 * e trata automaticamente erros de autenticação (498, 401)
 */
export function GlobalErrorHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Cria um listener global para erros de queries
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.action.error as { status?: number; message?: string };
        
        // Tratamento de rate limit (429)
        if (error?.status === 429) {
          console.warn("[GlobalErrorHandler] Rate limit detectado.");
          
          toast.error("Muitas requisições", {
            description: error.message || "Você fez muitas requisições. Por favor, aguarde alguns minutos e tente novamente.",
            duration: 8000,
          });
          return; // Não continua para outros tratamentos
        }
        
        // Verifica se é erro de autenticação (token expirado)
        if (error?.status === 498 || error?.status === 401) {
          console.warn("[GlobalErrorHandler] Token expirado detectado. Redirecionando para login...");
          
          toast.error("Sessão expirada", {
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            duration: 5000,
          });
          
          // Aguarda um pouco para o toast aparecer antes de redirecionar
          setTimeout(() => {
            signOut({ callbackUrl: '/login' });
          }, 1500);
        }
      }
    });

    // Listener para erros de mutations
    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") {
        const error = event.action.error as { status?: number; message?: string };
        
        // Tratamento de rate limit (429)
        if (error?.status === 429) {
          console.warn("[GlobalErrorHandler] Rate limit detectado em mutation.");
          
          toast.error("Muitas requisições", {
            description: error.message || "Você fez muitas requisições. Por favor, aguarde alguns minutos e tente novamente.",
            duration: 8000,
          });
          return; // Não continua para outros tratamentos
        }
        
        // Verifica se é erro de autenticação (token expirado)
        if (error?.status === 498 || error?.status === 401) {
          console.warn("[GlobalErrorHandler] Token expirado em mutation. Redirecionando para login...");
          
          toast.error("Sessão expirada", {
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            duration: 5000,
          });
          
          // Aguarda um pouco para o toast aparecer antes de redirecionar
          setTimeout(() => {
            signOut({ callbackUrl: '/login' });
          }, 1500);
        }
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
      unsubscribeMutation();
    };
  }, [queryClient]);

  return null; // Componente não renderiza nada
}
