"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginParams {
  identificador: string;
  senha: string;
  callbackUrl?: string;
}

export default function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login({ identificador, senha, callbackUrl = "/" }: LoginParams) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        identificador,
        senha,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Login realizado com sucesso");
        router.push(callbackUrl);
        return { ok: true };
      }

      const resAny = res as any;
      let message = resAny?.error || "Erro ao efetuar login";

      if (typeof resAny?.status === "number" && resAny.status === 401) {
        message = "Credenciais inválidas";
      }
      
      if (typeof message === "string" && message.startsWith("Error:")) {
        message = message.replace(/^Error:\s*/i, "");
      }

      setError(message);
      toast.error(message);
      return { ok: false, error: message };
    } catch (err: any) {
      const message = err?.message || "Erro ao efetuar login";
      setError(message);
      toast.error(message);
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    login,
    isLoading,
    error,
  };
}
