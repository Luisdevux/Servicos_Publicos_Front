// src/components/createTipoDemandaModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { tipoDemandaService } from '@/services/tipoDemandaService';
import { usuarioService } from '@/services/usuarioService';
import { TIPOS_DEMANDA } from '@/types';
import type { Usuarios } from '@/types';
import type { CreateTipoDemandaData, UpdateTipoDemandaData } from '@/types/tipoDemanda';
import type { TipoDemandaModel } from '@/types';

interface CreateTipoDemandaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoDemanda?: TipoDemandaModel | null;
  onSaved?: (updatedTipoDemanda: TipoDemandaModel) => void;
}

export function CreateTipoDemandaModal({ open, onOpenChange, tipoDemanda, onSaved }: CreateTipoDemandaModalProps) {
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [subdescricao, setSubdescricao] = useState('');
  const [icone, setIcone] = useState('');
  const [linkImagem, setLinkImagem] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useQuery({
    queryKey: ['usuarios', 'all-for-tipo-demanda', open],
    enabled: open,
    queryFn: async () => {
      let allDocs: Usuarios[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await usuarioService.buscarUsuariosPaginado({}, 50, page);
        const payload = res.data;
        if (payload?.docs?.length) {
          allDocs = allDocs.concat(payload.docs);
        }
        totalPages = payload?.totalPages || 1;
        page++;
      } while (page <= totalPages);
      return allDocs;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (open && tipoDemanda) {
      setTitulo(tipoDemanda.titulo || '');
      setDescricao(tipoDemanda.descricao || '');
      setSubdescricao(tipoDemanda.subdescricao || '');
      setIcone(tipoDemanda.icone || '');
      setLinkImagem(tipoDemanda.link_imagem || '');
      setTipo(tipoDemanda.tipo || '');
      setImagem(null);
      if (tipoDemanda.link_imagem && (tipoDemanda.link_imagem.startsWith('http://') || tipoDemanda.link_imagem.startsWith('https://') || tipoDemanda.link_imagem.startsWith('data:'))) {
        setPreviewUrl(tipoDemanda.link_imagem);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [open, tipoDemanda]);

  useEffect(() => {
    const currentPreview = previewUrl;
    return () => {
      if (currentPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [previewUrl]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande', {
        description: 'A imagem deve ter no máximo 5MB',
      });
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Selecione apenas arquivos de imagem',
      });
      e.target.value = '';
      return;
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setImagem(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.success('Imagem adicionada');
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    const currentPreview = previewUrl;
    setImagem(null);
    setPreviewUrl(null);
    if (currentPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }
    toast.info('Imagem removida');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!titulo.trim()) {
      toast.error('Campo obrigatório: Título', {
        description: 'Preencha o título da demanda',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (tipoDemanda?._id) {
        const updatePayload: UpdateTipoDemandaData = {};
        
        if (titulo.trim() !== tipoDemanda.titulo) updatePayload.titulo = titulo.trim();
        if (descricao.trim() !== tipoDemanda.descricao) updatePayload.descricao = descricao.trim();
        if (subdescricao.trim() !== (tipoDemanda.subdescricao || '')) updatePayload.subdescricao = subdescricao.trim();
        if ((icone.trim() || '') !== (tipoDemanda.icone || '')) updatePayload.icone = icone.trim() || '';
        if ((linkImagem.trim() || '') !== (tipoDemanda.link_imagem || '')) updatePayload.link_imagem = linkImagem.trim() || '';
        if (tipo.trim() !== tipoDemanda.tipo) updatePayload.tipo = tipo.trim();

        if (Object.keys(updatePayload).length === 0 && !imagem) {
          toast.info('Nenhuma alteração para salvar.');
          onOpenChange(false);
          return;
        }

        if (Object.keys(updatePayload).length > 0) {
          await tipoDemandaService.atualizarTipoDemanda(tipoDemanda._id, updatePayload);
        }

        if (imagem) {
          await tipoDemandaService.uploadFotoTipoDemanda(tipoDemanda._id, imagem);
          const updatedResponse = await tipoDemandaService.buscarTipoDemandaPorId(tipoDemanda._id);
          if (updatedResponse.data && onSaved) {
            onSaved(updatedResponse.data);
          }
        }

        toast.success('Tipo de demanda atualizado com sucesso!');
      } else {
        const payload: CreateTipoDemandaData = {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          subdescricao: subdescricao.trim(),
          icone: icone.trim() || '',
          link_imagem: linkImagem.trim() || '',
          tipo: tipo.trim(),
        };

        const response = await tipoDemandaService.criarTipoDemanda(payload);
        
        if (response.data?._id && imagem) {
          await tipoDemandaService.uploadFotoTipoDemanda(response.data._id, imagem);
        }

        toast.success('Tipo de demanda criado com sucesso!');
        
        setTitulo('');
        setDescricao('');
        setSubdescricao('');
        setIcone('');
        setLinkImagem('');
        setTipo('');
        setImagem(null);
        setPreviewUrl(null);
      }
      
      void queryClient.invalidateQueries({ queryKey: ['tipoDemanda'] });
      
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : (tipoDemanda ? 'Erro ao atualizar tipo de demanda' : 'Erro ao criar tipo de demanda');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl"
        data-test="create-tipo-demanda-dialog"
      >
        <DialogHeader className="bg-global-accent py-6 px-6 rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dialog-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="white" />
                  <circle cx="0" cy="0" r="1" fill="white" />
                  <circle cx="60" cy="0" r="1" fill="white" />
                  <circle cx="0" cy="60" r="1" fill="white" />
                  <circle cx="60" cy="60" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dialog-grid)" />
            </svg>
          </div>

          <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

          <DialogTitle
            className="text-2xl font-bold text-center text-white drop-shadow-md relative z-10"
            data-test="create-tipo-demanda-title"
          >
            {tipoDemanda ? 'Editar Tipo de Demanda' : 'Adicionar Novo Tipo de Demanda'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Coleta de Entulho" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DEMANDA.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Solicite coleta de entulho, restos de construção, reforma e materiais volumosos que não são coletados no lixo comum" disabled={isSubmitting} />
          </div>

          <div className="space-y-3">
            <Label className="text-global-text-secondary text-base font-semibold">
              Imagem do card
            </Label>

            {previewUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-global-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    if (previewUrl?.startsWith('blob:')) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setPreviewUrl(null);
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 cursor-pointer"
                  aria-label="Remover imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label
                htmlFor="imagem-tipo-demanda"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all mt-3",
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-global-accent hover:shadow-lg hover:brightness-110 text-white"
                )}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">
                  {previewUrl ? 'Trocar imagem' : 'Adicionar imagem'}
                </span>
                <input
                  id="imagem-tipo-demanda"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-global-text-primary">
              Tamanho máximo: 5MB
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-global-border bg-white text-global-text-primary hover:bg-global-bg-select font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-global-accent hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {tipoDemanda ? 'Salvar alterações' : 'Criar Tipo de Demanda'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
