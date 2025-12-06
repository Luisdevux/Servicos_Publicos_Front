// src/components/createTipoDemandaModal.tsx
'use client';

import { useState, useEffect } from 'react';
 import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { tipoDemandaService } from '@/services/tipoDemandaService';
import { usuarioService } from '@/services/usuarioService';
import { TIPOS_DEMANDA } from '@/types';
import type { Usuarios } from '@/types';
import type { CreateTipoDemandaData, UpdateTipoDemandaData } from '@/types/tipoDemanda';
import type { TipoDemandaModel } from '@/types';
import { createTipoDemandaSchema, type CreateTipoDemandaFormValues } from '@/lib/validations/tipoDemanda';

interface CreateTipoDemandaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoDemanda?: TipoDemandaModel | null;
  onSaved?: (updatedTipoDemanda: TipoDemandaModel) => void;
}

export function CreateTipoDemandaModal({ open, onOpenChange, tipoDemanda, onSaved }: CreateTipoDemandaModalProps) {
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CreateTipoDemandaFormValues>({
    resolver: zodResolver(createTipoDemandaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      subdescricao: '',
      icone: '',
      link_imagem: '',
      tipo: '',
    },
  });

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
      form.reset({
        titulo: tipoDemanda.titulo || '',
        descricao: tipoDemanda.descricao || '',
        subdescricao: tipoDemanda.subdescricao || '',
        icone: tipoDemanda.icone || '',
        link_imagem: tipoDemanda.link_imagem || '',
        tipo: tipoDemanda.tipo || '',
      });
      setImagem(null);
      if (tipoDemanda.link_imagem && (tipoDemanda.link_imagem.startsWith('http://') || tipoDemanda.link_imagem.startsWith('https://') || tipoDemanda.link_imagem.startsWith('data:'))) {
        setPreviewUrl(tipoDemanda.link_imagem);
      } else {
        setPreviewUrl(null);
      }
    } else if (!open) {
      form.reset();
    }
  }, [open, tipoDemanda, form]);

  useEffect(() => {
    const currentPreview = previewUrl;
    return () => {
      if (currentPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [previewUrl]);


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

  const onSubmit = async (data: CreateTipoDemandaFormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (tipoDemanda?._id) {
        const updatePayload: UpdateTipoDemandaData = {};
        
        const trimmed = {
          titulo: data.titulo.trim(),
          descricao: data.descricao.trim(),
          subdescricao: data.subdescricao?.trim() || '',
          icone: data.icone?.trim() || '',
          link_imagem: data.link_imagem?.trim() || '',
          tipo: data.tipo.trim(),
        };

        if (trimmed.titulo !== tipoDemanda.titulo) updatePayload.titulo = trimmed.titulo;
        if (trimmed.descricao !== tipoDemanda.descricao) updatePayload.descricao = trimmed.descricao;
        if (trimmed.subdescricao !== (tipoDemanda.subdescricao || '')) updatePayload.subdescricao = trimmed.subdescricao;
        if (trimmed.icone !== (tipoDemanda.icone || '')) updatePayload.icone = trimmed.icone;
        if (trimmed.link_imagem !== (tipoDemanda.link_imagem || '')) updatePayload.link_imagem = trimmed.link_imagem;
        if (trimmed.tipo !== tipoDemanda.tipo) updatePayload.tipo = trimmed.tipo;

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
          titulo: data.titulo.trim(),
          descricao: data.descricao.trim(),
          subdescricao: data.subdescricao?.trim() || '',
          icone: data.icone?.trim() || '',
          link_imagem: data.link_imagem?.trim() || '',
          tipo: data.tipo.trim(),
        };

        const response = await tipoDemandaService.criarTipoDemanda(payload);
        
        if (response.data?._id && imagem) {
          await tipoDemandaService.uploadFotoTipoDemanda(response.data._id, imagem);
        }

        toast.success('Tipo de demanda criado com sucesso!');
        
        form.reset();
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
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o); }} modal>
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

        <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" data-test="create-tipo-demanda-form" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem data-test="campo-titulo-wrapper">
                      <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Título
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Coleta de Entulho"
                          className="border-global-border focus:border-global-accent focus:ring-global-accent"
                          data-test="input-titulo-tipo-demanda"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage data-test="erro-titulo" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem data-test="campo-tipo-wrapper">
                      <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Tipo
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger data-test="select-tipo-tipo-demanda">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent data-test="select-tipo-options">
                          {TIPOS_DEMANDA.map((t) => (
                            <SelectItem key={t} value={t} data-test={`select-tipo-option-${t.toLowerCase().replace(/\s+/g, '-')}`}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage data-test="erro-tipo" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem data-test="campo-descricao-wrapper">
                    <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Descrição
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Solicite coleta de entulho, restos de construção, reforma e materiais volumosos que não são coletados no lixo comum"
                        className="border-global-border focus:border-global-accent focus:ring-global-accent"
                        data-test="input-descricao-tipo-demanda"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage data-test="erro-descricao" />
                  </FormItem>
                )}
              />

          <div className="space-y-3">
            <label className="text-global-text-secondary text-base font-semibold">
              Imagem do card
            </label>

            {previewUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-global-border group" data-test="preview-imagem-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  data-test="preview-imagem"
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
                  data-test="button-remover-imagem"
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
                data-test="label-upload-imagem"
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
                  data-test="input-imagem"
                />
              </label>
            </div>
            <p className="text-xs text-global-text-primary">
              Tamanho máximo: 5MB
            </p>
          </div>

              <div className="flex gap-3 pt-2" data-test="create-tipo-demanda-actions">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-2 border-global-border bg-white text-global-text-primary hover:bg-global-bg-select font-medium"
                  disabled={isSubmitting}
                  data-test="button-cancelar"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 bg-global-accent hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all",
                    isSubmitting && "opacity-70 cursor-not-allowed"
                  )}
                  data-test="button-criar-tipo"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {tipoDemanda ? 'Salvando...' : 'Criando...'}
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
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
