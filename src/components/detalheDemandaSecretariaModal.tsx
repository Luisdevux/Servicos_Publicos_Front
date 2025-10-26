"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ImageCarousel } from "./ui/image-carousel";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "./ui/select";
import type { Usuarios } from "@/types";

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
    numero: string;
  };
}

interface DetalhesDemandaSecretariaModalProps {
  demanda: Demanda | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmar?: (demandaId: string, operadorId: string) => void;
  onRejeitar?: (demandaId: string, motivo: string) => void;
  operadores?: Usuarios[];
  isConfirmando?: boolean;
  isRejeitando?: boolean;
}

export default function DetalhesDemandaSecretariaModal({ 
  demanda, 
  isOpen, 
  onClose,
  onConfirmar,
  onRejeitar,
  operadores = [],
  isConfirmando = false,
  isRejeitando = false
}: DetalhesDemandaSecretariaModalProps) {
  const [showRejeitarModal, setShowRejeitarModal] = useState(false);
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [operadorSelecionado, setOperadorSelecionado] = useState("");

  if (!demanda) return null;

  const handleRejeitar = () => {
    if (motivoRejeicao.trim() && onRejeitar) {
      onRejeitar(demanda.id, motivoRejeicao);
      setMotivoRejeicao("");
      setShowRejeitarModal(false);
      onClose();
    }
  };

  const handleConfirmar = () => {
    if (operadorSelecionado && onConfirmar) {
      onConfirmar(demanda.id, operadorSelecionado);
      setOperadorSelecionado("");
      setShowConfirmarModal(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showRejeitarModal && !showConfirmarModal} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white border-none flex flex-col [&>button]:text-white [&>button]:hover:text-gray-200"
        >
          <DialogHeader className="bg-purple-600 py-4 px-6 rounded-t-lg flex-shrink-0">
            <DialogTitle className="text-center text-xl font-semibold text-white">
              {demanda.titulo}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 min-h-0 scrollbar-hide">
            <div className="space-y-6">
              {demanda.descricao && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-600">
                    Descrição da demanda
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p>{demanda.descricao}</p>
                  </div>
                </div>
              )}

              {demanda.imagem && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-purple-600">
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
                  <h3 className="text-lg font-medium text-purple-600">
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

          {demanda.status === "Em aberto" && (
            <div className="flex gap-3 px-6 pb-6 flex-shrink-0">
              <Button
                onClick={() => setShowRejeitarModal(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Rejeitar
              </Button>
              <Button
                onClick={() => setShowConfirmarModal(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Confirmar
              </Button>
            </div>
          )}

          {demanda.status !== "Em aberto" && (
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="text-sm text-gray-600">
                  <strong>Status:</strong> {demanda.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejeitarModal} onOpenChange={setShowRejeitarModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Motivo da Rejeição
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea
              placeholder="Digite o motivo da rejeição..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejeitarModal(false)}
                className="flex-1 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRejeitar}
                disabled={!motivoRejeicao.trim() || isRejeitando}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isRejeitando ? "Rejeitando..." : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmarModal} onOpenChange={setShowConfirmarModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Escolher Operador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Selecione o operador responsável
              </label>
              <Select value={operadorSelecionado} onValueChange={setOperadorSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um operador" />
                </SelectTrigger>
                <SelectContent>
                  {operadores.length > 0 ? (
                    operadores.map((operador) => (
                      <SelectItem key={operador._id || operador.nome} value={operador._id || ''}>
                        {operador.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhum operador disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmarModal(false)}
                className="flex-1 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmar}
                disabled={!operadorSelecionado || isConfirmando}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                {isConfirmando ? "Atribuindo..." : "Atribuir ao Operador"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
