// src/components/cardPedido.tsx

"use client";

import { Check, X, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import ProgressoPedido from "./ProgressoPedido";
import type { Pedido } from "@/types";

interface CardPedidoProps {
  pedido: Pedido;
  onVerMais?: (id: string) => void;
}

export default function CardPedido({ pedido, onVerMais }: CardPedidoProps) {
  const handleVerMais = () => {
    if (onVerMais) {
      onVerMais(pedido.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-md border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
      data-test={`card-pedido-${pedido.id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-md font-medium text-[var(--global-text-primary)]"
          data-test="card-pedido-titulo"
        >
          {pedido.titulo}
        </h3>
        
        {pedido.status === "aceito" ? (
          <div 
            className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium"
            data-test="card-pedido-status-aceito"
          >
            <Check size={16} />
            Aceito
          </div>
        ) : (
          <div 
            className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium"
            data-test="card-pedido-status-recusado"
          >
            <X size={16} />
            Recusado
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center" data-test="card-pedido-progresso-section">
        {pedido.status === "aceito" && pedido.progresso && (
          <div className="mb-10 mt-10"> 
            <ProgressoPedido progresso={pedido.progresso} size="sm" />
          </div>
        )}

        {pedido.status === "recusado" && (
          <div className="mb-10 mt-10">
            <ProgressoPedido 
              progresso={{ aprovado: true, emProgresso: true, concluido: true }} 
              size="sm" 
              variant="error" 
            />
          </div>
        )}
      </div>

      <Button 
        className="w-full flex items-center justify-center gap-1 text-[var(--global-accent)] hover:text-[var(--global-accent-hover)] text-sm cursor-pointer" 
        onClick={handleVerMais}
        data-test="card-pedido-ver-mais-btn"
      >
        Ver mais
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
