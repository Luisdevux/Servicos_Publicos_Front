"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ImageCarousel } from "./ui/image-carousel";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { usuarioService } from "@/services/usuarioService";
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
    numero: number;
  };
  usuarios?: (string | { _id: string; nome: string })[];
  resolucao?: string;
  motivo_devolucao?: string;
  link_imagem_resolucao?: string | string[];
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

  // Buscar dados do operador quando a demanda tem operadores atribuídos
  const operadorRaw = demanda?.usuarios?.[0];
  
  // Garantir que operadorId é uma string (pode vir como string ou objeto populado da API)
  const operadorIdString = typeof operadorRaw === 'string' 
    ? operadorRaw 
    : (operadorRaw as { _id?: string })?._id || '';
  
  const { data: operadorData } = useQuery({
    queryKey: ['operador', operadorIdString],
    queryFn: () => usuarioService.buscarUsuarioPorId(operadorIdString),
    enabled: !!operadorIdString && (demanda?.status === "Em andamento" || demanda?.status === "Concluída"),
  });

  const nomeOperador = operadorData?.data?.nome || 'Carregando...';

  if (!demanda) return null;

  // Debug: verificar se link_imagem_resolucao está chegando
  if (demanda.status === "Concluída") {
    console.log("Demanda concluída - link_imagem_resolucao:", demanda.link_imagem_resolucao);
  }

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
          className="!max-w-2xl !max-h-[90vh] overflow-hidden p-0 bg-white border-none shadow-2xl flex flex-col"
        >
          {/* Background decorativo */}
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="modal-grid-secretaria" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modal-grid-secretaria)"/>
            </svg>
            <div className="absolute top-40 left-10 w-16 h-16 border-2 border-current rounded-lg rotate-12 opacity-30"></div>
            <div className="absolute bottom-20 right-16 w-12 h-12 border-2 border-current rounded-full opacity-30"></div>
            <div className="absolute top-1/2 right-8 w-8 h-8 border-2 border-current rotate-45 opacity-30"></div>
          </div>

          <DialogHeader className="bg-purple-600 py-6 px-6 rounded-t-lg relative overflow-hidden shrink-0 z-10">
            {/* Grid de pontos decorativos */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dialog-grid-secretaria" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="2" fill="white" />
                    <circle cx="0" cy="0" r="1" fill="white" />
                    <circle cx="60" cy="0" r="1" fill="white" />
                    <circle cx="0" cy="60" r="1" fill="white" />
                    <circle cx="60" cy="60" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dialog-grid-secretaria)" />
              </svg>
            </div>

            {/* Elementos decorativos geométricos */}
            <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
            <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

            <DialogTitle className="text-3xl font-bold text-center text-white drop-shadow-md relative z-10">
              {demanda.titulo}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 min-h-0 scrollbar-hide relative z-10">
            <div className="space-y-6">
              {demanda.descricao && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-purple-600">
                    Descrição da demanda
                  </h3>
                  <div className="bg-global-bg-select p-4 rounded-md">
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
                      <div className="p-2 rounded-md bg-global-bg-select text-sm">
                        {demanda.endereco.bairro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Tipo de logradouro</label>
                      <div className="p-2 rounded-md bg-global-bg-select text-sm">
                        {demanda.endereco.tipoLogradouro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Logradouro</label>
                      <div className="p-2 rounded-md bg-global-bg-select text-sm">
                        {demanda.endereco.logradouro}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600">Número</label>
                      <div className="p-2 rounded-md bg-global-bg-select text-sm">
                        {demanda.endereco.numero}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar motivo de devolução quando a demanda está em aberto e foi devolvida pelo operador */}
              {demanda.status === "Em aberto" && demanda.motivo_devolucao && (
                <div className="space-y-2">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-orange-800 mb-2">
                      ⚠️ Demanda devolvida pelo operador
                    </h3>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-orange-700">Motivo da devolução:</label>
                      <div className="p-3 rounded-md bg-white border border-orange-200">
                        <p className="text-sm text-gray-800">{demanda.motivo_devolucao}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mostrar operador atribuído quando está em andamento */}
              {demanda.status === "Em andamento" && demanda.usuarios && demanda.usuarios.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-purple-600">
                    Operador Responsável
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="font-medium text-blue-900">{nomeOperador}</p>
                  </div>
                </div>
              )}

              {/* Mostrar informações completas quando concluída */}
              {demanda.status === "Concluída" && (
                <>
                  {demanda.usuarios && demanda.usuarios.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-purple-600">
                        Operador Responsável
                      </h3>
                      <div className="bg-global-bg-select rounded-md p-3">
                        <p className="font-medium text-global-text-primary">{nomeOperador}</p>
                      </div>
                    </div>
                  )}

                  {demanda.resolucao && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-purple-600">
                        Descrição da conclusão da demanda
                      </h3>
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="text-global-text-primary">{demanda.resolucao}</p>
                      </div>
                    </div>
                  )}

                  {demanda.link_imagem_resolucao && (() => {
                    const imagensResolucao = Array.isArray(demanda.link_imagem_resolucao)
                      ? demanda.link_imagem_resolucao.filter((img): img is string => Boolean(img && typeof img === 'string' && img.trim() !== ''))
                      : (demanda.link_imagem_resolucao && typeof demanda.link_imagem_resolucao === 'string' && demanda.link_imagem_resolucao.trim() !== '')
                        ? [demanda.link_imagem_resolucao]
                        : [];
                    
                    return imagensResolucao.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-purple-600">
                          {imagensResolucao.length > 1 ? 'Imagens da conclusão' : 'Imagem da conclusão'}
                        </h3>
                        <ImageCarousel 
                          images={imagensResolucao}
                          alt="Imagem da conclusão"
                          className="h-48"
                        />
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </div>
          </div>

          {demanda.status === "Em aberto" && (
            <div className="flex gap-3 px-6 pb-6 shrink-0">
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
