// src/components/SessionErrorHandler.tsx

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLogout } from "@/hooks/useLogout";
import { SessionExpiredModal } from "./SessionExpiredModal";

/**
 * Componente que monitora erros na sessão e mostra modal quando o refresh token expira
 */
export function SessionErrorHandler() {
  const { data: session } = useSession();
  const { logout } = useLogout();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    // Verifica se há erro na sessão
    const sessionWithError = session as typeof session & { error?: string };

    if (sessionWithError?.error === "RefreshAccessTokenError") {
      console.error('[SessionErrorHandler] Erro no refresh token, mostrando modal...');
      setShowExpiredModal(true);
    }
  }, [session]);

  const handleModalClose = () => {
    setShowExpiredModal(false);
    // Após fechar o modal, faz logout silencioso
    logout({ silent: true });
  };

  return (
    <SessionExpiredModal
      isOpen={showExpiredModal}
      onClose={handleModalClose}
    />
  );
}
