"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ImageCarousel } from "./ui/image-carousel";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Upload } from "lucide-react";

interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  status: string;
  imagem?: string | string[];
  endereco?: {
    bairro: string;
    tipoLogradouro: string;
    logradouro: string;
    numero: number;
  };
  resolucao?: string;
  link_imagem_resolucao?: string | string[];
}

interface DetalhesDemandaOperadorModalProps {
  demanda: Demanda | null;
  isOpen: boolean;
  onClose: () => void;
  onDevolver?: (demandaId: string, motivo: string) => void;
  onResolver?: (demandaId: string, descricao: string, imagens: File[]) => void;
  isDevolvendo?: boolean;
  isResolvendo?: boolean;
}

export default function DetalhesDemandaOperadorModal({ 
  demanda, 
  isOpen, 
  onClose,
  onDevolver,
  onResolver,
  isDevolvendo = false,
  isResolvendo = false
}: DetalhesDemandaOperadorModalProps) {
  const [showDevolverModal, setShowDevolverModal] = useState(false);
  const [showResolverModal, setShowResolverModal] = useState(false);
  const [motivoDevolucao, setMotivoDevolucao] = useState("");
  const [descricaoResolucao, setDescricaoResolucao] = useState("");
  const [imagensResolucao, setImagensResolucao] = useState<File[]>([]);

  if (!demanda) return null;

  // Debug: verificar se link_imagem_resolucao está chegando
  if (demanda.status === "Concluída") {
    console.log("Demanda concluída no operador - link_imagem_resolucao:", demanda.link_imagem_resolucao);
  }

  const handleDevolver = () => {
    if (motivoDevolucao.trim() && onDevolver) {
      onDevolver(demanda.id, motivoDevolucao);
      setMotivoDevolucao("");
      setShowDevolverModal(false);
      onClose();
    }
  };

  const handleResolver = () => {
    if (descricaoResolucao.trim() && imagensResolucao.length > 0 && onResolver) {
      onResolver(demanda.id, descricaoResolucao, imagensResolucao);
      setDescricaoResolucao("");
      setImagensResolucao([]);
      setShowResolverModal(false);
      onClose();
    }
  };

  const handleImagensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagensResolucao(Array.from(e.target.files));
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showDevolverModal && !showResolverModal} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white border-none shadow-2xl flex flex-col [&>button]:text-white [&>button]:hover:text-gray-200"
        >
          <DialogHeader className="bg-green-600 py-6 px-6 rounded-t-lg relative overflow-hidden flex-shrink-0">
            {/* Grid de pontos decorativos */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dialog-grid-operador" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="2" fill="white" />
                    <circle cx="0" cy="0" r="1" fill="white" />
                    <circle cx="60" cy="0" r="1" fill="white" />
                    <circle cx="0" cy="60" r="1" fill="white" />
                    <circle cx="60" cy="60" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dialog-grid-operador)" />
              </svg>
            </div>

            {/* Elementos decorativos geométricos */}
            <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
            <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

            <DialogTitle className="text-3xl font-bold text-center text-white drop-shadow-md relative z-10">
              {demanda.titulo}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 min-h-0 scrollbar-hide">
            <div className="space-y-6">
              {demanda.descricao && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-green-600">
                    Descrição da demanda
                  </h3>
                  <div className="bg-[var(--global-bg-select)] p-4 rounded-md">
                    <p>{demanda.descricao}</p>
                  </div>
                </div>
              )}

              {demanda.imagem && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-green-600">
                    {Array.isArray(demanda.imagem) ? 'Imagens da demanda' : 'Imagem da demanda'}
                  </h3>
                  <ImageCarousel 
                    images={Array.isArray(demanda.imagem) ? demanda.imagem : [demanda.imagem]}
                    alt="Imagem da demanda"
                    className="h-48"
                  />
                </div>
              )}

              {demanda.endereco && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-green-600">
                    Endereço do ocorrido
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Bairro</label>
                      <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm">
                        {demanda.endereco.bairro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Tipo de logradouro</label>
                      <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm">
                        {demanda.endereco.tipoLogradouro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Logradouro</label>
                      <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm">
                        {demanda.endereco.logradouro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Número</label>
                      <div className="p-2 rounded-md bg-[var(--global-bg-select)] text-sm">
                        {demanda.endereco.numero}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar informações de conclusão quando a demanda estiver concluída */}
              {demanda.status === "Concluída" && (
                <>
                  {demanda.resolucao && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-green-600">
                        Descrição da conclusão da demanda
                      </h3>
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="text-[var(--global-text-primary)]">{demanda.resolucao}</p>
                      </div>
                    </div>
                  )}

                  {demanda.link_imagem_resolucao && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-green-600">
                        {Array.isArray(demanda.link_imagem_resolucao) ? 'Imagens da conclusão' : 'Imagem da conclusão'}
                      </h3>
                      <ImageCarousel 
                        images={
                          Array.isArray(demanda.link_imagem_resolucao) 
                            ? demanda.link_imagem_resolucao.map(img => 
                                img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011'}/demandas/${demanda.id}/foto/resolucao`
                              )
                            : [demanda.link_imagem_resolucao.startsWith('http') 
                                ? demanda.link_imagem_resolucao 
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5011'}/demandas/${demanda.id}/foto/resolucao`
                              ]
                        }
                        alt="Imagem da conclusão"
                        className="h-48"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {demanda.status !== "Concluída" && (
            <div className="flex gap-3 px-6 pb-6 flex-shrink-0">
              <Button
                onClick={() => setShowDevolverModal(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Devolver
              </Button>
              <Button
                onClick={() => setShowResolverModal(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Resolver
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDevolverModal} onOpenChange={setShowDevolverModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Motivo da Devolução
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea
              placeholder="Digite o motivo da devolução..."
              value={motivoDevolucao}
              onChange={(e) => setMotivoDevolucao(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDevolverModal(false)}
                className="flex-1 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDevolver}
                disabled={!motivoDevolucao.trim() || isDevolvendo}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
              >
                {isDevolvendo ? "Devolvendo..." : "Confirmar Devolução"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResolverModal} onOpenChange={setShowResolverModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Resolução da Demanda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descrição da resolução
              </label>
              <Textarea
                placeholder="Descreva como a demanda foi resolvida..."
                value={descricaoResolucao}
                onChange={(e) => setDescricaoResolucao(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Imagens da resolução
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagensChange}
                  className="hidden"
                  id="upload-resolucao"
                />
                <label htmlFor="upload-resolucao" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {imagensResolucao.length > 0 
                      ? `${imagensResolucao.length} imagem(ns) selecionada(s)` 
                      : 'Clique para anexar imagens'}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowResolverModal(false)}
                className="flex-1 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleResolver}
                disabled={!descricaoResolucao.trim() || imagensResolucao.length === 0 || isResolvendo}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isResolvendo ? "Resolvendo..." : "Confirmar Resolução"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
