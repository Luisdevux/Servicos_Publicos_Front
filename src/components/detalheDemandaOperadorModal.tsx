"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ImageCarousel } from "./ui/image-carousel";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  if (!demanda) return null;

  // Debug: verificar se link_imagem_resolucao está chegando
  if (demanda.status === "Concluída") {
    console.log("=== MODAL OPERADOR - Demanda concluída ===");
    console.log("ID:", demanda.id);
    console.log("Status:", demanda.status);
    console.log("Resolução:", demanda.resolucao);
    console.log("link_imagem_resolucao:", demanda.link_imagem_resolucao);
    console.log("tipo:", typeof demanda.link_imagem_resolucao);
    console.log("é array?", Array.isArray(demanda.link_imagem_resolucao));
    console.log("==========================================");
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
    if (!descricaoResolucao.trim()) {
      toast.error('Descrição obrigatória', {
        description: 'Preencha a descrição da resolução',
      });
      return;
    }

    if (imagensResolucao.length === 0) {
      toast.error('Imagem obrigatória', {
        description: 'Adicione pelo menos uma imagem da resolução',
      });
      return;
    }

    if (onResolver) {
      onResolver(demanda.id, descricaoResolucao, imagensResolucao);
      setDescricaoResolucao("");
      setImagensResolucao([]);
      
      // Limpar preview URLs
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setPreviewUrls([]);
      
      setShowResolverModal(false);
      onClose();
    }
  };

  const handleImagensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 3;

    // Validar tamanho
    const invalidFiles = newFiles.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error('Arquivo muito grande', {
        description: 'Cada imagem deve ter no máximo 5MB',
      });
      e.target.value = '';
      return;
    }

    // Validar quantidade
    if (imagensResolucao.length + newFiles.length > maxFiles) {
      toast.warning('Limite de imagens', {
        description: `Você pode adicionar no máximo ${maxFiles} imagens`,
      });
      e.target.value = '';
      return;
    }

    setImagensResolucao(prev => [...prev, ...newFiles]);

    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);

    toast.success(`${newFiles.length} imagem${newFiles.length > 1 ? 'ns' : ''} adicionada${newFiles.length > 1 ? 's' : ''}`);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImagensResolucao(prev => prev.filter((_, i) => i !== index));

    if (previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));

    toast.info('Imagem removida');
  };

  return (
    <>
      <Dialog open={isOpen && !showDevolverModal && !showResolverModal} onOpenChange={onClose}>
        <DialogContent 
          className="!max-w-2xl !max-h-[90vh] overflow-hidden p-0 bg-white border-none shadow-2xl flex flex-col"
        >
          {/* Background decorativo */}
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="modal-grid-operador" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modal-grid-operador)"/>
            </svg>
            <div className="absolute top-40 left-10 w-16 h-16 border-2 border-current rounded-lg rotate-12 opacity-30"></div>
            <div className="absolute bottom-20 right-16 w-12 h-12 border-2 border-current rounded-full opacity-30"></div>
            <div className="absolute top-1/2 right-8 w-8 h-8 border-2 border-current rotate-45 opacity-30"></div>
          </div>

          <DialogHeader className="bg-green-600 py-6 px-6 rounded-t-lg relative overflow-hidden shrink-0 z-10">
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

          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 min-h-0 scrollbar-hide relative z-10">
            <div className="space-y-6">
              {demanda.descricao && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-green-600">
                    Descrição da demanda
                  </h3>
                  <div className="bg-global-bg-select p-4 rounded-md">
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

              {/* Mostrar informações de conclusão quando a demanda estiver concluída */}
              {demanda.status === "Concluída" && (
                <>
                  {demanda.resolucao && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-green-600">
                        Descrição da conclusão da demanda
                      </h3>
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="text-global-text-primary">{demanda.resolucao}</p>
                      </div>
                    </div>
                  )}

                  {demanda.link_imagem_resolucao && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-green-600">
                        {Array.isArray(demanda.link_imagem_resolucao) && demanda.link_imagem_resolucao.length > 1 
                          ? 'Imagens da conclusão' 
                          : 'Imagem da conclusão'}
                      </h3>
                      <ImageCarousel 
                        images={
                          Array.isArray(demanda.link_imagem_resolucao) 
                            ? demanda.link_imagem_resolucao 
                            : [demanda.link_imagem_resolucao]
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
            <div className="flex gap-3 px-6 pb-6 shrink-0">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-white border-none shadow-2xl">
          <DialogHeader className="bg-green-600 py-6 px-6 rounded-t-lg relative overflow-hidden">
            {/* Grid de pontos decorativos */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dialog-grid-resolver" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="2" fill="white" />
                    <circle cx="0" cy="0" r="1" fill="white" />
                    <circle cx="60" cy="0" r="1" fill="white" />
                    <circle cx="0" cy="60" r="1" fill="white" />
                    <circle cx="60" cy="60" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dialog-grid-resolver)" />
              </svg>
            </div>

            {/* Elementos decorativos geométricos */}
            <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
            <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

            <DialogTitle className="text-3xl font-bold text-center text-white drop-shadow-md relative z-10">
              Resolução da Demanda
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="descricao-resolucao" className="text-global-text-secondary text-base font-semibold flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Descrição da resolução
                </Label>
                <span className={cn(
                  "text-xs font-medium",
                  descricaoResolucao.length > 500 ? "text-red-500" : "text-global-text-primary"
                )}>
                  {descricaoResolucao.length}/500
                </span>
              </div>
              <Textarea
                id="descricao-resolucao"
                placeholder="Descreva como a demanda foi resolvida..."
                value={descricaoResolucao}
                onChange={(e) => setDescricaoResolucao(e.target.value)}
                maxLength={500}
                className={cn(
                  "min-h-[120px] resize-none border-global-border focus:border-green-600 focus:ring-green-600",
                  descricaoResolucao.length > 500 && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-global-text-secondary text-base font-semibold flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Imagens da resolução
                </Label>
                <span className="text-xs text-global-text-primary">
                  {previewUrls.length}/3 imagens
                </span>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-global-border group">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 200px"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 cursor-pointer"
                        aria-label={`Remover imagem ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <label
                  htmlFor="upload-resolucao"
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer transition-all font-medium shadow-md",
                    previewUrls.length < 3
                      ? "bg-green-600 hover:shadow-lg hover:brightness-110 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">
                    {previewUrls.length === 0 ? 'Adicionar imagens' : 'Adicionar mais'}
                  </span>
                </label>
                {previewUrls.length > 0 && (
                  <span className="text-sm text-global-text-primary font-medium">
                    {previewUrls.length} imagem{previewUrls.length > 1 ? 'ns' : ''} adicionada{previewUrls.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagensChange}
                disabled={previewUrls.length >= 3}
                className="hidden"
                id="upload-resolucao"
              />

              <p className="text-xs text-global-text-primary">
                Máximo de 3 imagens • Tamanho máximo: 5MB por imagem
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-global-border">
              <Button
                onClick={() => {
                  setShowResolverModal(false);
                  setDescricaoResolucao("");
                  setImagensResolucao([]);
                  previewUrls.forEach(url => {
                    if (url.startsWith('blob:')) {
                      URL.revokeObjectURL(url);
                    }
                  });
                  setPreviewUrls([]);
                }}
                disabled={isResolvendo}
                className="flex-1 border-2 border-global-border bg-white text-global-text-primary hover:bg-global-bg-select font-medium"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleResolver}
                disabled={!descricaoResolucao.trim() || imagensResolucao.length === 0 || isResolvendo}
                className={cn(
                  "flex-1 bg-green-600 hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all",
                  (isResolvendo || !descricaoResolucao.trim() || imagensResolucao.length === 0) && "opacity-70 cursor-not-allowed"
                )}
              >
                {isResolvendo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolvendo...
                  </>
                ) : (
                  "Confirmar Resolução"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
