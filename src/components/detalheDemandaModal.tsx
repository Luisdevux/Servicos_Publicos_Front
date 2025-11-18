// src/components/detalheDemandaModal.tsx

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import ProgressoPedido from "./ProgressoPedido";
import { StarRating } from "./ui/star-rating";
import { Button } from "./ui/button";
import { ImageCarousel } from "./ui/image-carousel";
import { useState, useEffect } from "react";
import type { Pedido } from "@/types";
import { demandaService } from "@/services/demandaService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DetalhesDemandaModalProps {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetalhesDemandaModal({ pedido, isOpen, onClose }: DetalhesDemandaModalProps) {
  const [rating, setRating] = useState(0);
  const [avaliacao, setAvaliacao] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const isConcluido = pedido?.progresso?.concluido;
  
  useEffect(() => {
    if (pedido) {
      setRating(pedido.avaliacao?.feedback || 0);
      setAvaliacao(pedido.avaliacao?.avaliacao_resolucao || "");
    } else {
      setRating(0);
      setAvaliacao("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido?.id, isOpen]);

  if (!pedido) return null;

  const handleEnviarAvaliacao = async () => {
    if (rating > 0 && avaliacao.trim()) {
      setIsLoading(true);
      try {
        await demandaService.atualizarDemanda(pedido.id, {
          feedback: rating,
          avaliacao_resolucao: avaliacao.trim(),
        });
        queryClient.invalidateQueries({ queryKey: ['demandas'] });
        toast.success("Avaliação enviada com sucesso!");
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao enviar avaliação";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl! max-h-[90vh]! overflow-hidden p-0 bg-white border-none flex flex-col"
        data-test="detalhe-demanda-modal"
      >
        {/* Background decorativo */}
        <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="modal-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#modal-grid)"/>
          </svg>
          <div className="absolute top-10 left-10 w-16 h-16 border-2 border-current rounded-lg rotate-12 opacity-30"></div>
          <div className="absolute bottom-20 right-16 w-12 h-12 border-2 border-current rounded-full opacity-30"></div>
          <div className="absolute top-1/2 right-8 w-8 h-8 border-2 border-current rotate-45 opacity-30"></div>
        </div>

        <DialogHeader className="bg-global-accent py-6 px-6 rounded-t-lg shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dialog-grid-demanda" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white" />
                  <circle cx="0" cy="0" r="1" fill="white" />
                  <circle cx="60" cy="0" r="1" fill="white" />
                  <circle cx="0" cy="60" r="1" fill="white" />
                  <circle cx="60" cy="60" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dialog-grid-demanda)" />
            </svg>
          </div>

          <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

          <DialogTitle 
            className="text-3xl font-bold text-center text-white drop-shadow-md relative z-10"
            data-test="modal-titulo"
          >
            {pedido.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 min-h-0 scrollbar-hide relative z-10">
          <div className="mb-4" data-test="progresso-section">
            {pedido.status !== "Recusada" && pedido.progresso && (
              <ProgressoPedido 
                progresso={pedido.progresso}
                variant={pedido.status === "Em aberto" ? "warning" : "default"}
              />
            )}
            {pedido.status === "Recusada" && (
              <ProgressoPedido 
                progresso={{ aprovado: true, emProgresso: true, concluido: true }} 
                variant="error" 
              />
            )}
          </div>

          <div className="space-y-6">
          {pedido.descricao && (
            <div className="space-y-4" data-test="descricao-section">
              <h3 className="text-lg font-medium text-global-text-primary">
                Descrição da demanda
              </h3>
              <div className="bg-global-bg-select p-4 rounded-md">
                <p data-test="descricao-texto">{pedido.descricao}</p>
              </div>
            </div>
          )}

          {pedido.link_imagem && (
            <div className="space-y-2" data-test="imagens-demanda-section">
              <h3 className="text-lg font-medium text-global-text-primary">
                {Array.isArray(pedido.link_imagem) ? 'Imagens da demanda' : 'Imagem da demanda'}
              </h3>
              <ImageCarousel
                images={Array.isArray(pedido.link_imagem) ? pedido.link_imagem : [pedido.link_imagem]}
                alt="Imagem da demanda"
              />
            </div>
          )}

        {pedido.endereco && (
            <div className="space-y-2" data-test="endereco-section">
              <h3 className="text-lg font-medium text-global-text-primary">
                Endereço do ocorrido
              </h3>
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <label className="text-sm text-gray-600">CEP</label>
                  <div className="p-2 rounded-md bg-global-bg-select text-sm" data-test="endereco-tipo-logradouro">
                    {pedido.endereco.cep}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Bairro</label>
                  <div className="p-2 rounded-md bg-global-bg-select text-sm" data-test="endereco-bairro">
                    {pedido.endereco.bairro}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Logradouro</label>
                  <div className="p-2 rounded-md bg-global-bg-select text-sm" data-test="endereco-logradouro">
                    {pedido.endereco.logradouro}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">Número</label>
                  <div className="p-2 rounded-md bg-global-bg-select text-sm" data-test="endereco-numero">
                    {pedido.endereco.numero}
                  </div>
                </div>
              </div>
              {pedido.endereco.complemento && (
              <div className="space-y-1">
                  <label className="text-sm text-gray-600">Complemento</label>
                  <div className="p-2 rounded-md bg-global-bg-select text-sm" data-test="endereco-complemento">
                    {pedido.endereco.complemento}
                  </div>
              </div>)}
            </div>
          )}

        {isConcluido && pedido.conclusao && (
            <div className="space-y-2" data-test="conclusao-section">
              <h3 className="text-lg font-medium text-global-text-primary">
                Descrição da conclusão da demanda
              </h3>
              <div className="bg-green-50 p-4 rounded-md border border-green-200">
                <p className="text-global-text-primary" data-test="conclusao-descricao">{pedido.conclusao.descricao}</p>
              </div>
            </div>
        )}

         {(() => {
             const imagensResolucao = Array.isArray(pedido.link_imagem_resolucao)
               ? pedido.link_imagem_resolucao.filter((img): img is string => Boolean(img && typeof img === 'string' && img.trim() !== ''))
               : (pedido.link_imagem_resolucao && typeof pedido.link_imagem_resolucao === 'string' && pedido.link_imagem_resolucao.trim() !== '')
                 ? [pedido.link_imagem_resolucao]
                 : [];
             
             return isConcluido && imagensResolucao.length > 0 ? (
               <div className="space-y-2" data-test="imagens-conclusao-section">
                 <h3 className="text-lg font-medium text-global-text-primary">
                   {imagensResolucao.length > 1 ? 'Imagens da conclusão' : 'Imagem da conclusão'}
                 </h3>
                 <ImageCarousel 
                   images={imagensResolucao}
                   alt="Imagem da conclusão"
                 />
               </div>
             ) : null;
           })()}

        {isConcluido && (
            <div className="space-y-4" data-test="avaliacao-section">
              <h3 className="text-lg font-medium text-global-text-primary">
                {pedido.avaliacao ? "Sua avaliação" : "Avalie esse serviço"}
              </h3>
              <div className="space-y-4">
                <textarea
                  value={avaliacao}
                  onChange={(e) => setAvaliacao(e.target.value)}
                  placeholder="Escreva a sua avaliação"
                  disabled={!!pedido.avaliacao}
                  className="w-full p-3 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-global-accent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  data-test="avaliacao-textarea"
                />
                <div className="flex items-center gap-4">
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    maxStars={5}
                    readonly={!!pedido.avaliacao}
                  />
                  <span className="text-sm text-gray-600">{pedido.avaliacao ? "Avaliado" : "Avalie"}</span>
                </div>
                {!pedido.avaliacao && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleEnviarAvaliacao}
                      disabled={rating === 0 || !avaliacao.trim() || isLoading}
                      className="bg-global-accent hover:bg-global-accent-hover text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      data-test="enviar-avaliacao-btn"
                    >
                      {isLoading ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


