"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Enquanto o estado da sessão estiver carregando, você pode mostrar um loader
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">
          Verificando autenticação...
        </div>
      </div>
    );
  }

  // Se está autenticado, renderiza os filhos
  if (status === "authenticated") {
    return <>{children}</>;
  }

  // Evita renderizar algo antes da verificação
  return null;
}