// src/app/(auth)/layout.tsx

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Não renderiza nada até verificar a sessão
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-global-accent border-t-transparent mx-auto"></div>
          <p className="mt-6 text-global-text-primary font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Só renderiza os children se autenticado
  if (status === "authenticated") {
    return <>{children}</>;
  }

  // Evita renderizar algo antes da verificação
  return null;
}