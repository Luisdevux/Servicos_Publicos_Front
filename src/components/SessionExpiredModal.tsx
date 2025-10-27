// src/components/SessionExpiredModal.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLoginRedirect = async () => {
    setIsRedirecting(true);
    onClose();

    // Pequeno delay para animação
    setTimeout(() => {
      router.push("/login/municipe");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <DialogTitle>Sessão Expirada</DialogTitle>
          </div>
          <DialogDescription>
            Sua sessão de usuário expirou por inatividade. Para continuar usando o sistema,
            faça login novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para a página de login. Seus dados não salvos podem ser perdidos.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleLoginRedirect}
            disabled={isRedirecting}
            className="w-full"
          >
            {isRedirecting ? "Redirecionando..." : "Fazer Login"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}