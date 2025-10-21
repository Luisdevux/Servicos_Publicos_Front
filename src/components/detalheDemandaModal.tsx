"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Pedido } from "./cardPedido";
import ProgressoPedido from "./ProgressoPedido";
import Image from "next/image";
import { StarRating } from "./ui/star-rating";
import { Button } from "./ui/button";
import { ImageCarousel } from "./ui/image-carousel";
import { useState } from "react";

interface DetalhesDemandaModalProps {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetalhesDemandaModal({ pedido, isOpen, onClose }: DetalhesDemandaModalProps) {
  const [rating, setRating] = useState(0);
  const [avaliacao, setAvaliacao] = useState("");
  const isConcluido = pedido?.progresso?.concluido;

  if (!pedido) return null;

  const handleEnviarAvaliacao = () => {
    if (rating > 0 && avaliacao.trim()) {
      console.log("Avaliação enviada:", { rating, avaliacao, pedidoId: pedido.id });
      setRating(0);
      setAvaliacao("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white border-none flex flex-col [&>button]:text-white [&>button]:hover:text-gray-200"
        data-test="detalhe-demanda-modal"
      >
        <DialogHeader className="bg-[var(--global-accent)] py-4 px-6 rounded-t-lg flex-shrink-0">
          <DialogTitle 
            className="text-center text-xl font-semibold bg-[var(--global-accent)] text-white py-3 px-6 rounded-md text-white"
            data-test="modal-titulo"
          >
            {pedido.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 min-h-0 scrollbar-hide">
          <div className="mb-4" data-test="progresso-section">
            {pedido.status === "aceito" && pedido.progresso && (
              <ProgressoPedido progresso={pedido.progresso} />
            )}
            {pedido.status === "recusado" && (
              <ProgressoPedido 
                progresso={{ aprovado: true, emProgresso: true, concluido: true }} 
                variant="error" 
              />
            )}
          </div>

          <div className="space-y-6">
          {pedido.descricao && (
            <div className="space-y-4" data-test="descricao-section">
              <h3 className="text-lg font-medium text-[var(--global-text-primary)]">
                Descrição da demanda
              </h3>
              <div className="bg-[var(--global-bg-select)] p-4 rounded-md">
                <p data-test="descricao-texto">{pedido.descricao}</p>
              </div>
            </div>
          )}

          {pedido.imagem && (
            <div className="space-y-2" data-test="imagens-demanda-section">
              <h3 className="text-lg font-medium text-[var(--global-text-primary)]">
                {Array.isArray(pedido.imagem) ? 'Imagens da demanda' : 'Imagem da demanda'}
              </h3>
              <ImageCarousel 
                images={Array.isArray(pedido.imagem) ? pedido.imagem : [pedido.imagem]}
                alt="Imagem da demanda"
                className="h-48"
              />
            </div>
          )}

        {pedido.endereco && (
            <div className="space-y-2" data-test="endereco-section">
              <h3 className="text-lg font-medium text-[var(--global-text-primary)]">
                Endereço do ocorrido
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Bairro</label>
                  <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm" data-test="endereco-bairro">
                    {pedido.endereco.bairro}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Tipo de logradouro</label>
                  <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm" data-test="endereco-tipo-logradouro">
                    {pedido.endereco.tipoLogradouro}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Logradouro</label>
                  <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm" data-test="endereco-logradouro">
                    {pedido.endereco.logradouro}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Número</label>
                  <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm" data-test="endereco-numero">
                    {pedido.endereco.numero}
                  </div>
                </div>
              </div>
            </div>
          )}

        {isConcluido && pedido.conclusao && (
            <div className="space-y-2" data-test="conclusao-section">
              <h3 className="text-lg font-medium text-[var(--global-text-primary)]">
                Descrição da conclusão da demanda
              </h3>
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-[var(--global-text-primary)]" data-test="conclusao-descricao">{pedido.conclusao.descricao}</p>
              </div>
            </div>
        )}

         {isConcluido && pedido.conclusao?.imagem && (
             <div className="space-y-2" data-test="imagens-conclusao-section">
               <h3 className="text-lg font-medium text-[var(--global-text-primary)]">
                 {Array.isArray(pedido.conclusao.imagem) ? 'Imagens da conclusão' : 'Imagem da conclusão'}
               </h3>
               <ImageCarousel 
                 images={Array.isArray(pedido.conclusao.imagem) ? pedido.conclusao.imagem : [pedido.conclusao.imagem]}
                 alt="Imagem da conclusão"
                 className="h-48"
               />
             </div>
           )}

        {isConcluido && (
            <div className="space-y-4" data-test="avaliacao-section">
              <h3 className="text-lg font-medium text-[var(--global-text-primary)]">
                Avalie esse serviço
              </h3>
              <div className="space-y-4">
                <textarea
                  value={avaliacao}
                  onChange={(e) => setAvaliacao(e.target.value)}
                  placeholder="Escreva a sua avaliação"
                  className="w-full p-3 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--global-accent)]"
                  data-test="avaliacao-textarea"
                />
                <div className="flex items-center gap-4">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    maxStars={5}
                  />
                  <span className="text-sm text-gray-600">Avalie</span>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleEnviarAvaliacao}
                    disabled={rating === 0 || !avaliacao.trim()}
                    className="bg-[var(--global-accent)] hover:bg-[var(--global-accent-hover)] text-white"
                    data-test="enviar-avaliacao-btn"
                  >
                    Enviar Avaliação
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


