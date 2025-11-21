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
      // Salva preferência de "lembrar de mim" no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('shouldRememberSession', lembrarDeMim ? 'true' : 'false');
      }

      // Verifica rate limit ANTES de processar login
      try {
        const rateLimitCheck = await fetch('/api/auth/check-rate-limit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identificador, senha }),
        });

        if (rateLimitCheck.status === 429) {
          const data = await rateLimitCheck.json();
          const error = new Error(data.message || 'Muitas tentativas. Aguarde alguns minutos.') as Error & { status: number };
          error.status = 429;
          throw error;
        }
      } catch (error) {
        // Se for rate limit, propaga
        if ((error as Error & { status?: number }).status === 429) {
          throw error;
        }
        // Outros erros de rede, continua normalmente
      }

      // Faz requisição direta à API primeiro para capturar erro específico
      try {
        const apiLoginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011'}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identificador, senha }),
        });

        if (!apiLoginResponse.ok) {
          const errorData = await apiLoginResponse.json();
          const errorMessage = errorData.message || 'Credenciais inválidas';
          throw new Error(errorMessage);
        }
      } catch (error) {
        // Propaga o erro com a mensagem da API
        throw error;
      }

      // Autenticação via NextAuth
      const res = await signIn("credentials", {
        identificador,
        senha,
        lembrarDeMim: lembrarDeMim ? "true" : "false",
        tipoUsuario: tipoUsuario || "municipe",
        redirect: false,
      });

      if (res?.ok) {
        // Configura o cookie de sessão baseado em lembrarDeMim
        try {
          await fetch('/api/auth/set-session-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lembrarDeMim })
          });
        } catch (cookieError) {
          console.error('[useLogin] Erro ao configurar cookie:', cookieError);
        }

        return { ok: true };
      }

      throw new Error("Erro ao autenticar");
    },
    onSuccess: async (_, variables) => {
      toast.success("Login realizado com sucesso");
      
      // Busca informações do usuário da sessão para redirecionar corretamente
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session?.user?.nivel_acesso) {
          const nivelAcesso = session.user.nivel_acesso;
          
          // Redireciona baseado no nível de acesso (prioridade: admin > secretario > operador)
          if (nivelAcesso.administrador) {
            router.push('/admin/dashboard');
            return;
          }
          if (nivelAcesso.secretario) {
            router.push('/secretaria');
            return;
          }
          if (nivelAcesso.operador) {
            router.push('/operador');
            return;
          }
        }
      } catch (error) {
        console.error('[useLogin] Erro ao buscar sessão:', error);
      }
      
      // Fallback para callbackUrl ou home
      const callbackUrl = variables.callbackUrl || "/";
      router.push(callbackUrl);
    },
    onError: (error) => {
      const errorWithStatus = error as Error & { status?: number };
      
      // Rate limit - mostra mensagem específica e duradoura
      if (errorWithStatus.status === 429) {
        toast.error("Muitas requisições", {
          description: errorWithStatus.message || "Você fez muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.",
          duration: 8000,
        });
        return;
      }
      
      // Email não verificado mostra instruções específicas
      const errorMessage = error?.message || "Credenciais inválidas";
      
      if (errorMessage.toLowerCase().includes('email não verificado') || 
          errorMessage.toLowerCase().includes('verificar seu email') ||
          errorMessage.toLowerCase().includes('email nao verificado')) {
        toast.error("Email não verificado", {
          description: "Verifique sua caixa de entrada e clique no link de verificação que enviamos. Se não recebeu, verifique a pasta de spam.",
          duration: 10000,
        });
        return;
      }
      
      // Todos os outros erros - credenciais inválidas
      toast.error("Credenciais inválidas", {
        description: "Verifique seu email/CPF e senha e tente novamente.",
        duration: 5000,
      });
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
