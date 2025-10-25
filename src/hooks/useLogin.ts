// src/hooks/useLogin.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginParams {
  identificador: string;
  senha: string;
  lembrarDeMim?: boolean;
  callbackUrl?: string;
  tipoUsuario?: 'municipe' | 'funcionario';
}

interface LoginResponse {
  ok: boolean;
  error?: string;
}

export default function useLogin() {
  const router = useRouter();

  const loginMutation = useMutation<LoginResponse, Error, LoginParams>({
    mutationFn: async ({ identificador, senha, lembrarDeMim, tipoUsuario }) => {
      console.log('[useLogin] Login iniciado com lembrarDeMim:', lembrarDeMim, 'tipoUsuario:', tipoUsuario);

      // Salva preferência de "lembrar de mim" no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('shouldRememberSession', lembrarDeMim ? 'true' : 'false');
        console.log('[useLogin] shouldRememberSession salvo:', lembrarDeMim ? 'true' : 'false');
      }

      const res = await signIn("credentials", {
        identificador,
        senha,
        lembrarDeMim: lembrarDeMim ? "true" : "false",
        tipoUsuario: tipoUsuario || "municipe",
        redirect: false,
      });

      if (res?.ok) {
        console.log('[useLogin] Login bem-sucedido!');

        // Configura o cookie de sessão baseado em lembrarDeMim
        try {
          await fetch('/api/auth/set-session-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lembrarDeMim })
          });
          console.log('[useLogin] Cookie de sessão configurado');
        } catch (cookieError) {
          console.error('[useLogin] Erro ao configurar cookie:', cookieError);
        }

        return { ok: true };
      }

      throw new Error("Credenciais inválidas");
    },
    onSuccess: (_, variables) => {
      toast.success("Login realizado com sucesso");
      const callbackUrl = variables.callbackUrl || "/";
      router.push(callbackUrl);
    },
    onError: (error) => {
      const message = error?.message || "Erro ao efetuar login";
      toast.error(message);
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isSuccess: loginMutation.isSuccess,
    isError: loginMutation.isError,
  };
}
