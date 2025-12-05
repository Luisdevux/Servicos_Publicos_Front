// src/components/CreateDemandaDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateDemanda } from '@/hooks/useDemandaMutations';
import { useCepVilhena } from '@/hooks/useCepVilhena';
import { viaCepService } from '@/services';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  formatFileSize,
  validateImageMagicBytes,
  getAllowedImageTypesDisplay,
} from '@/lib/imageUtils';
import {
  createDemandaSchema,
  isValidImageFile,
  isValidFileSize,
  type CreateDemandaFormValues,
} from '@/lib/validations/demanda';
import type { TipoDemanda } from '@/types';

interface CreateDemandaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoDemanda?: string;
}

const TIPOS_LOGRADOURO = [
  'Rua',
  'Avenida',
  'Travessa',
  'Alameda',
  'Via',
  'Rodovia',
];

export function CreateDemandaDialog({
  open,
  onOpenChange,
  tipoDemanda = '',
}: CreateDemandaDialogProps) {
  const createDemanda = useCreateDemanda();
  const { buscarCep, formatarCep, validarCepEncontrado } = useCepVilhena();

  // Estados para autocomplete
  const [sugestoesLogradouro, setSugestoesLogradouro] = useState<
    Array<{ logradouro: string; bairro: string; cep: string }>
  >([]);
  const [sugestoesBairro, setSugestoesBairro] = useState<
    Array<{ bairro: string; cep: string }>
  >([]);
  const [showSugestoesLogradouro, setShowSugestoesLogradouro] = useState(false);
  const [showSugestoesBairro, setShowSugestoesBairro] = useState(false);
  const [loadingLogradouro, setLoadingLogradouro] = useState(false);
  const [loadingBairro, setLoadingBairro] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [enderecoPorCep, setEnderecoPorCep] = useState(false);

  // Estados para imagens
  const [imagens, setImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);

  const form = useForm<CreateDemandaFormValues>({
    resolver: zodResolver(createDemandaSchema),
    defaultValues: {
      cep: '',
      bairro: '',
      tipoLogradouro: 'Rua',
      logradouro: '',
      numero: '',
      complemento: '',
      descricao: '',
      imagens: [],
    },
  });

  // Limpar formulário quando dialog fecha
  useEffect(() => {
    if (!open) {
      form.reset({
        cep: '',
        bairro: '',
        tipoLogradouro: 'Rua',
        logradouro: '',
        numero: '',
        complemento: '',
        descricao: '',
        imagens: [],
      });
      setImagens([]);
      setUploadProgress(null);
      setEnderecoPorCep(false);
      setSugestoesLogradouro([]);
      setSugestoesBairro([]);
      setShowSugestoesLogradouro(false);
      setShowSugestoesBairro(false);

      // Limpar preview URLs
      setPreviewUrls((prevUrls) => {
        prevUrls.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        return [];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Busca automática por CEP
  const handleCepChange = async (value: string, onChange: (value: string) => void) => {
    const formatted = formatarCep(value);
    onChange(formatted);

    const apenasNumeros = formatted.replace(/\D/g, '');
    if (apenasNumeros.length === 8) {
      setLoadingCep(true);
      try {
        const endereco = await buscarCep(apenasNumeros);

        if (endereco) {
          setEnderecoPorCep(true);

          form.setValue('bairro', endereco.bairro || '');

          if (endereco.logradouro) {
            const palavras = endereco.logradouro.split(' ');
            const primeiroTermo = palavras[0];

            if (TIPOS_LOGRADOURO.includes(primeiroTermo)) {
              form.setValue('tipoLogradouro', primeiroTermo);
              form.setValue('logradouro', palavras.slice(1).join(' '));
            } else {
              form.setValue('logradouro', endereco.logradouro);
            }
          }
        }
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Busca de logradouro (autocomplete)
  useEffect(() => {
    if (enderecoPorCep) return;

    const logradouroValue = form.watch('logradouro');
    const timer = setTimeout(async () => {
      if (logradouroValue && logradouroValue.length >= 3) {
        setLoadingLogradouro(true);
        try {
          const resultados = await viaCepService.buscarCepsPorEndereco(
            'RO',
            'Vilhena',
            logradouroValue
          );

          const logradourosUnicos = resultados.reduce((acc, curr) => {
            const key = curr.logradouro.toLowerCase();
            if (!acc.some((item) => item.logradouro.toLowerCase() === key)) {
              acc.push({
                logradouro: curr.logradouro,
                bairro: curr.bairro,
                cep: curr.cep,
              });
            }
            return acc;
          }, [] as Array<{ logradouro: string; bairro: string; cep: string }>);

          setSugestoesLogradouro(logradourosUnicos);
          setShowSugestoesLogradouro(logradourosUnicos.length > 0);
        } catch (error) {
          console.error('Erro ao buscar logradouros:', error);
        } finally {
          setLoadingLogradouro(false);
        }
      } else {
        setSugestoesLogradouro([]);
        setShowSugestoesLogradouro(false);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('logradouro'), enderecoPorCep]);

  // Busca de bairro (autocomplete)
  useEffect(() => {
    if (enderecoPorCep) return;

    const bairroValue = form.watch('bairro');
    const timer = setTimeout(async () => {
      if (bairroValue && bairroValue.length >= 3) {
        setLoadingBairro(true);
        try {
          const resultados = await viaCepService.buscarCepsPorEndereco(
            'RO',
            'Vilhena',
            bairroValue
          );

          const bairrosUnicos = resultados.reduce((acc, curr) => {
            const key = curr.bairro.toLowerCase();
            if (curr.bairro && !acc.some((item) => item.bairro.toLowerCase() === key)) {
              acc.push({
                bairro: curr.bairro,
                cep: curr.cep,
              });
            }
            return acc;
          }, [] as Array<{ bairro: string; cep: string }>);

          setSugestoesBairro(bairrosUnicos);
          setShowSugestoesBairro(bairrosUnicos.length > 0);
        } catch (error) {
          console.error('Erro ao buscar bairros:', error);
        } finally {
          setLoadingBairro(false);
        }
      } else {
        setSugestoesBairro([]);
        setShowSugestoesBairro(false);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('bairro'), enderecoPorCep]);

  // Selecionar sugestão de logradouro
  const selecionarLogradouro = (sugestao: {
    logradouro: string;
    bairro: string;
    cep: string;
  }) => {
    const palavras = sugestao.logradouro.split(' ');
    const primeiroTermo = palavras[0];

    if (TIPOS_LOGRADOURO.includes(primeiroTermo)) {
      form.setValue('tipoLogradouro', primeiroTermo);
      form.setValue('logradouro', palavras.slice(1).join(' '));
    } else {
      form.setValue('logradouro', sugestao.logradouro);
    }

    form.setValue('bairro', sugestao.bairro);
    form.setValue('cep', formatarCep(sugestao.cep));
    setShowSugestoesLogradouro(false);
  };

  // Selecionar sugestão de bairro
  const selecionarBairro = (sugestao: { bairro: string; cep: string }) => {
    form.setValue('bairro', sugestao.bairro);
    form.setValue('cep', formatarCep(sugestao.cep));
    setShowSugestoesBairro(false);
  };

  // Manipular upload de imagens
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 3;

    // Validar tipo
    const invalidTypes = newFiles.filter((file) => !isValidImageFile(file));
    if (invalidTypes.length > 0) {
      toast.error('Tipo de arquivo inválido', {
        description: `Apenas imagens ${getAllowedImageTypesDisplay()} são aceitas`,
      });
      e.target.value = '';
      return;
    }

    // Validar tamanho
    const invalidFiles = newFiles.filter((file) => !isValidFileSize(file, 5));
    if (invalidFiles.length > 0) {
      const sizesMsg = invalidFiles
        .map((f) => `${f.name} (${formatFileSize(f.size)})`)
        .join(', ');
      toast.error('Arquivo muito grande', {
        description: `Arquivos acima do limite: ${sizesMsg}. Máximo: ${formatFileSize(
          maxSize
        )}`,
      });
      e.target.value = '';
      return;
    }

    // Validar quantidade
    if (imagens.length + newFiles.length > maxFiles) {
      toast.warning('Limite de imagens', {
        description: `Você pode adicionar no máximo ${maxFiles} imagens`,
      });
      e.target.value = '';
      return;
    }

    // Validar magic bytes
    const validateImageFiles = async () => {
      const validationPromises = newFiles.map((file) => validateImageMagicBytes(file));
      const results = await Promise.all(validationPromises);

      const invalidImages = results.filter((isValid) => !isValid);
      if (invalidImages.length > 0) {
        toast.error('Arquivo corrompido ou inválido', {
          description: 'Um ou mais arquivos não são imagens válidas',
        });
        e.target.value = '';
        return false;
      }
      return true;
    };

    validateImageFiles().then((isValid) => {
      if (!isValid) return;

      const updatedImages = [...imagens, ...newFiles];
      setImagens(updatedImages);
      form.setValue('imagens', updatedImages);

      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);

      toast.success(
        `${newFiles.length} imagem${newFiles.length > 1 ? 'ns' : ''} adicionada${
          newFiles.length > 1 ? 's' : ''
        }`
      );
      e.target.value = '';
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = imagens.filter((_, i) => i !== index);
    setImagens(updatedImages);
    form.setValue('imagens', updatedImages);

    if (previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    toast.info('Imagem removida');
  };

  const onSubmit = async (data: CreateDemandaFormValues) => {
    if (!tipoDemanda) {
      toast.error('Tipo de demanda obrigatório', {
        description: 'Selecione um tipo de demanda antes de continuar',
      });
      return;
    }

    // Validar CEP com ViaCEP
    const cepValidation = validarCepEncontrado(data.cep);
    if (!cepValidation.valid) {
      toast.error('CEP inválido', {
        description: cepValidation.message || 'Digite um CEP válido de Vilhena',
      });
      return;
    }

    try {
      const logradouroCompleto = `${data.tipoLogradouro} ${data.logradouro}`.trim();
      const numeroInt = parseInt(data.numero.replace(/\D/g, ''), 10);

      await createDemanda.mutateAsync({
        tipo: tipoDemanda as TipoDemanda,
        descricao: data.descricao.trim(),
        endereco: {
          logradouro: logradouroCompleto,
          cep: data.cep.replace(/\D/g, ''),
          bairro: data.bairro.trim(),
          numero: numeroInt,
          complemento: data.complemento?.trim() || undefined,
          cidade: 'Vilhena',
          estado: 'RO',
        },
        imagens: imagens.length > 0 ? imagens : undefined,
        onUploadProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      toast.success('Demanda criada com sucesso!', {
        description: 'Você pode acompanhar o andamento em "Meus Pedidos"',
        icon: <CheckCircle2 className="w-5 h-5" />,
        duration: 5000,
      });

      setUploadProgress(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar demanda:', error);
      setUploadProgress(null);
      toast.error('Erro ao criar demanda', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        icon: <AlertCircle className="w-5 h-5" />,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl"
        data-test="create-demanda-dialog"
      >
        <DialogHeader className="bg-global-accent py-6 px-6 rounded-t-lg relative overflow-hidden">
          {/* Grid decorativo */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="dialog-grid"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
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

          {/* Elementos decorativos */}
          <div className="absolute top-4 left-8 w-12 h-12 border-2 border-white/20 rounded-lg rotate-12"></div>
          <div className="absolute bottom-4 right-8 w-10 h-10 border-2 border-white/20 rounded-full"></div>

          <DialogTitle
            className="text-3xl font-bold text-center text-white drop-shadow-md relative z-10"
            data-test="create-demanda-title"
          >
            {tipoDemanda || 'Nova Demanda'}
          </DialogTitle>
          <DialogDescription className="text-center text-white/90 mt-1 relative z-10">
            Preencha os dados abaixo para criar sua solicitação
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6 max-h-[calc(95vh-140px)] overflow-y-auto"
            data-test="create-demanda-form"
            noValidate
          >
            {/* Seção de Endereço */}
            <div className="space-y-4 p-4 bg-global-bg-select rounded-lg border border-global-border">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-global-accent" />
                <h3 className="text-global-text-secondary text-base font-semibold">
                  Endereço do Ocorrido
                </h3>
              </div>

              {/* Linha 1: CEP e Bairro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-global-text-primary text-sm font-medium">
                        CEP
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            onChange={(e) => handleCepChange(e.target.value, field.onChange)}
                            placeholder="00000-000"
                            maxLength={9}
                            disabled={loadingCep}
                            className="border-global-border focus-visible:ring-global-accent focus-visible:border-global-accent pr-10"
                            data-test="cep-input"
                          />
                          {loadingCep && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-global-accent" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Bairro
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setEnderecoPorCep(false);
                              setShowSugestoesBairro(true);
                            }}
                            onBlur={() => setTimeout(() => setShowSugestoesBairro(false), 200)}
                            onFocus={() => {
                              if (sugestoesBairro.length > 0 && !enderecoPorCep) {
                                setShowSugestoesBairro(true);
                              }
                            }}
                            placeholder="Digite o bairro"
                            className="border-global-border focus-visible:ring-global-accent focus-visible:border-global-accent pr-10"
                            data-test="bairro-input"
                          />
                          {loadingBairro && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-global-accent" />
                            </div>
                          )}

                          {/* Dropdown sugestões bairro */}
                          {showSugestoesBairro && sugestoesBairro.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-global-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {sugestoesBairro.map((sugestao, index) => (
                                <div
                                  key={index}
                                  onClick={() => selecionarBairro(sugestao)}
                                  className="px-4 py-2 hover:bg-global-bg-select cursor-pointer transition-colors border-b border-global-border last:border-b-0"
                                >
                                  <div className="font-medium text-global-text-primary">
                                    {sugestao.bairro}
                                  </div>
                                  <div className="text-xs text-global-text-secondary">
                                    CEP: {formatarCep(sugestao.cep)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Linha 2: Tipo e Logradouro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="tipoLogradouro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Tipo
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className="border border-global-accent hover:border-global-accent-hover! focus:border-global-accent! focus:ring-global-accent cursor-pointer"
                            data-test="tipo-logradouro-select"
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          className="border! border-global-accent"
                          data-test="tipo-logradouro-options"
                        >
                          {TIPOS_LOGRADOURO.map((tipo) => (
                            <SelectItem
                              key={tipo}
                              value={tipo}
                              className="cursor-pointer"
                              data-test={`tipo-logradouro-option-${tipo.toLowerCase()}`}
                            >
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logradouro"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Logradouro
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setEnderecoPorCep(false);
                              setShowSugestoesLogradouro(true);
                            }}
                            onBlur={() =>
                              setTimeout(() => setShowSugestoesLogradouro(false), 200)
                            }
                            onFocus={() => {
                              if (sugestoesLogradouro.length > 0 && !enderecoPorCep) {
                                setShowSugestoesLogradouro(true);
                              }
                            }}
                            placeholder="Nome da rua, avenida..."
                            className="border-global-border focus-visible:ring-global-accent focus-visible:border-global-accent"
                            data-test="logradouro-input"
                          />
                          {loadingLogradouro && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-global-accent" />
                            </div>
                          )}

                          {/* Dropdown sugestões logradouro */}
                          {showSugestoesLogradouro && sugestoesLogradouro.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-global-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {sugestoesLogradouro.map((sugestao, index) => (
                                <div
                                  key={index}
                                  onClick={() => selecionarLogradouro(sugestao)}
                                  className="px-4 py-3 hover:bg-global-bg-select cursor-pointer transition-colors border-b border-global-border last:border-b-0"
                                >
                                  <div className="font-medium text-global-text-primary">
                                    {sugestao.logradouro}
                                  </div>
                                  <div className="flex gap-4 mt-1">
                                    <span className="text-xs text-global-text-secondary">
                                      Bairro: {sugestao.bairro}
                                    </span>
                                    <span className="text-xs text-global-text-secondary">
                                      CEP: {formatarCep(sugestao.cep)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Linha 3: Número e Complemento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                        <span className="text-red-500">*</span>
                        Número
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                          placeholder="Ex: 5222"
                          className="border-global-border focus-visible:ring-global-accent focus-visible:border-global-accent"
                          data-test="numero-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-global-text-primary text-sm font-medium">
                        Complemento
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Apto, bloco..."
                          className="border-global-border focus-visible:ring-global-accent focus-visible:border-global-accent"
                          data-test="complemento-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Linha 4: Cidade e Estado (fixos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    Cidade
                  </FormLabel>
                  <Input
                    value="Vilhena"
                    placeholder="Vilhena"
                    className="border-global-border bg-gray-100 text-gray-500 cursor-not-allowed"
                    data-test="cidade-input"
                    disabled
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-global-text-primary text-sm font-medium flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    Estado
                  </FormLabel>
                  <Input
                    value="RO"
                    placeholder="Rondônia"
                    className="border-global-border bg-gray-100 text-gray-500 cursor-not-allowed"
                    data-test="estado-input"
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-global-text-secondary text-base font-semibold flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Descrição
                    </FormLabel>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        field.value.length > 500 ? 'text-red-500' : 'text-global-text-primary'
                      )}
                    >
                      {field.value.length}/500
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva detalhadamente o problema encontrado..."
                      maxLength={500}
                      className={cn(
                        'min-h-[120px] resize-none border-global-border focus-visible:ring-global-accent focus-visible:border-global-accent',
                        field.value.length > 500 &&
                          'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                      )}
                      data-test="descricao-textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Imagens */}
            <FormField
              control={form.control}
              name="imagens"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-global-text-secondary text-base font-semibold flex items-center gap-2">
                      <span className="text-red-500">*</span>
                      Imagens
                    </FormLabel>
                    <span className="text-xs text-global-text-primary">
                      {previewUrls.length}/3 imagens
                    </span>
                  </div>

                  {previewUrls.length > 0 && (
                    <div
                      className="grid grid-cols-3 gap-3 mb-3"
                      data-test="images-preview-grid"
                    >
                      {previewUrls.map((url, index) => (
                        <div
                          key={url}
                          className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-global-border group"
                          data-test={`image-preview-container-${index}`}
                        >
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 200px"
                            data-test={`image-preview-${index}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 cursor-pointer"
                            data-test={`remove-image-button-${index}`}
                            aria-label={`Remover imagem ${index + 1}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <FormControl>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="imagem"
                        className={cn(
                          'flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer transition-all font-medium shadow-md',
                          previewUrls.length < 3
                            ? 'bg-global-accent hover:shadow-lg hover:brightness-110 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        )}
                        data-test="image-upload-label"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">
                          {previewUrls.length === 0 ? 'Adicionar imagens' : 'Adicionar mais'}
                        </span>
                        <input
                          id="imagem"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/svg+xml,.jpg,.jpeg,.png,.svg"
                          multiple
                          onChange={handleImageChange}
                          disabled={previewUrls.length >= 3}
                          className="hidden"
                          data-test="image-input"
                        />
                      </label>
                      {previewUrls.length > 0 && (
                        <span
                          className="text-sm text-global-text-primary font-medium"
                          data-test="images-count"
                        >
                          {previewUrls.length} imagem{previewUrls.length > 1 ? 'ns' : ''}{' '}
                          adicionada{previewUrls.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </FormControl>

                  <FormDescription className="text-xs">
                    <span className="text-red-500 font-semibold">*</span> Obrigatório: mínimo 1
                    imagem • Máximo de 3 imagens • Tamanho máximo: 5MB por imagem
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t border-global-border">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={createDemanda.isPending}
                className="flex-1 border-2 border-global-border bg-white text-global-text-primary hover:bg-global-bg-select font-medium"
                data-test="cancel-button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createDemanda.isPending}
                className={cn(
                  'flex-1 bg-global-accent hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all',
                  createDemanda.isPending && 'opacity-70 cursor-not-allowed'
                )}
                data-test="submit-button"
              >
                {createDemanda.isPending ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {uploadProgress
                          ? `Enviando imagens ${uploadProgress.current}/${uploadProgress.total}...`
                          : 'Criando demanda...'}
                      </span>
                    </div>
                    {uploadProgress && (
                      <div className="w-full bg-white/30 rounded-full h-1.5">
                        <div
                          className="bg-white h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Criar Demanda
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
