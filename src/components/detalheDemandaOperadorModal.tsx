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
  imagem?: string | string[];
  endereco?: {
    bairro: string;
    tipoLogradouro: string;
    logradouro: string;
    numero: string;
  };
}

interface DetalhesDemandaOperadorModalProps {
  demanda: Demanda | null;
  isOpen: boolean;
  onClose: () => void;
  onDevolver?: (demandaId: string, motivo: string) => void;
  onResolver?: (demandaId: string, descricao: string, imagens: File[]) => void;
}

export default function DetalhesDemandaOperadorModal({ 
  demanda, 
  isOpen, 
  onClose,
  onDevolver,
  onResolver 
}: DetalhesDemandaOperadorModalProps) {
  const [showDevolverModal, setShowDevolverModal] = useState(false);
  const [showResolverModal, setShowResolverModal] = useState(false);
  const [motivoDevolucao, setMotivoDevolucao] = useState("");
  const [descricaoResolucao, setDescricaoResolucao] = useState("");
  const [imagensResolucao, setImagensResolucao] = useState<File[]>([]);

  if (!demanda) return null;

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
          className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white border-none flex flex-col [&>button]:text-white [&>button]:hover:text-gray-200"
        >
          <DialogHeader className="bg-green-600 py-4 px-6 rounded-t-lg flex-shrink-0">
            <DialogTitle className="text-center text-xl font-semibold text-white">
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
                  <div className="bg-gray-50 p-4 rounded-md">
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
                      <div className="p-2 rounded-md bg-gray-50 text-sm">
                        {demanda.endereco.bairro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Tipo de logradouro</label>
                      <div className="p-2 rounded-md bg-gray-50 text-sm">
                        {demanda.endereco.tipoLogradouro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Logradouro</label>
                      <div className="p-2 rounded-md bg-gray-50 text-sm">
                        {demanda.endereco.logradouro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Número</label>
                      <div className="p-2 rounded-md bg-gray-50 text-sm">
                        {demanda.endereco.numero}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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
                disabled={!motivoDevolucao.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Confirmar Devolução
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
                disabled={!descricaoResolucao.trim() || imagensResolucao.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Confirmar Resolução
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
