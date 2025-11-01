// src/components/CreateDemandaDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useCreateDemanda } from '@/hooks/useDemandaMutations';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { 
  isValidImageType, 
  formatFileSize, 
  validateImageMagicBytes,
  getAllowedImageTypesDisplay
} from '@/lib/imageUtils';
import type { TipoDemanda, EstadoBrasil } from '@/types';

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

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function CreateDemandaDialog({ open, onOpenChange, tipoDemanda = '' }: CreateDemandaDialogProps) {
  const createDemanda = useCreateDemanda();

  const [descricao, setDescricao] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipoLogradouro, setTipoLogradouro] = useState('Rua');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('Vilhena');
  const [estado, setEstado] = useState('RO');
  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [imagens, setImagens] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percentage: number } | null>(null);

  // Estados para autocomplete
  const [sugestoesLogradouro, setSugestoesLogradouro] = useState<Array<{ logradouro: string; bairro: string; cep: string }>>([]);
  const [sugestoesBairro, setSugestoesBairro] = useState<Array<{ bairro: string; cep: string }>>([]);
  const [showSugestoesLogradouro, setShowSugestoesLogradouro] = useState(false);
  const [showSugestoesBairro, setShowSugestoesBairro] = useState(false);
  const [loadingLogradouro, setLoadingLogradouro] = useState(false);
  const [loadingBairro, setLoadingBairro] = useState(false);

  // Limpar formulário quando dialog fecha
  useEffect(() => {
    if (!open) {
      setDescricao('');
      setBairro('');
      setTipoLogradouro('Rua');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setCidade('Vilhena');
      setEstado('RO');
      setCep('');
      setImagens([]);
      setUploadProgress(null);

      setPreviewUrls(prev => {
        prev.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        return [];
      });
    }
  }, [open]);

  // Máscara de CEP com busca automática
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }

    setCep(value);

    // Se tiver 8 dígitos, busca o endereço automaticamente
    const apenasNumeros = value.replace(/\D/g, '');
    if (apenasNumeros.length === 8) {
      setLoadingCep(true);
      try {
        const endereco = await viaCepService.buscarEnderecoPorCep(apenasNumeros);

        if (endereco) {
          // Preenche os campos automaticamente
          setBairro(endereco.bairro || '');
          setCidade(endereco.localidade || 'Vilhena');
          setEstado((endereco.uf as EstadoBrasil) || 'RO');

          // Extrai tipo e logradouro do campo "logradouro" do ViaCEP
          if (endereco.logradouro) {
            const palavras = endereco.logradouro.split(' ');
            const primeiroTermo = palavras[0];

            // Verifica se o primeiro termo é um tipo conhecido
            if (TIPOS_LOGRADOURO.includes(primeiroTermo)) {
              setTipoLogradouro(primeiroTermo);
              setLogradouro(palavras.slice(1).join(' '));
            } else {
              setLogradouro(endereco.logradouro);
            }
          }

          toast.success('CEP encontrado! Endereço preenchido automaticamente.');
        } else {
          toast.error('CEP não encontrado. Verifique o número digitado.');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP. Tente novamente.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Busca de logradouro
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (logradouro.length >= 3) {
        setLoadingLogradouro(true);
        try {
          const resultados = await viaCepService.buscarCepsPorEndereco('RO', 'Vilhena', logradouro);

          // Remove duplicatas por logradouro completo
          const logradourosUnicos = resultados.reduce((acc, curr) => {
            const key = curr.logradouro.toLowerCase();
            if (!acc.some(item => item.logradouro.toLowerCase() === key)) {
              acc.push({
                logradouro: curr.logradouro,
                bairro: curr.bairro,
                cep: curr.cep
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
  }, [logradouro]);

  // Busca de bairro
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (bairro.length >= 3) {
        setLoadingBairro(true);
        try {
          const resultados = await viaCepService.buscarCepsPorEndereco('RO', 'Vilhena', bairro);

          // Remove duplicatas por bairro e agrupa
          const bairrosUnicos = resultados.reduce((acc, curr) => {
            const key = curr.bairro.toLowerCase();
            if (curr.bairro && !acc.some(item => item.bairro.toLowerCase() === key)) {
              acc.push({
                bairro: curr.bairro,
                cep: curr.cep
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
  }, [bairro]);

  // Selecionar sugestão de logradouro
  const selecionarLogradouro = (sugestao: { logradouro: string; bairro: string; cep: string }) => {
    // Extrai tipo e logradouro
    const palavras = sugestao.logradouro.split(' ');
    const primeiroTermo = palavras[0];

    if (TIPOS_LOGRADOURO.includes(primeiroTermo)) {
      setTipoLogradouro(primeiroTermo);
      setLogradouro(palavras.slice(1).join(' '));
    } else {
      setLogradouro(sugestao.logradouro);
    }

    setBairro(sugestao.bairro);
    setCep(viaCepService.formatarCep(sugestao.cep));
    setShowSugestoesLogradouro(false);
  };

  // Selecionar sugestão de bairro
  const selecionarBairro = (sugestao: { bairro: string; cep: string }) => {
    setBairro(sugestao.bairro);
    setCep(viaCepService.formatarCep(sugestao.cep));
    setShowSugestoesBairro(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 3;

    // Validar tipo de arquivo
    const invalidTypes = newFiles.filter(file => !isValidImageType(file.type));
    if (invalidTypes.length > 0) {
      toast.error('Tipo de arquivo inválido', {
        description: `Apenas imagens ${getAllowedImageTypesDisplay()} são aceitas`,
      });
      e.target.value = '';
      return;
    }

    // Validar tamanho
    const invalidFiles = newFiles.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      const sizesMsg = invalidFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
      toast.error('Arquivo muito grande', {
        description: `Arquivos acima do limite: ${sizesMsg}. Máximo permitido: ${formatFileSize(maxSize)}`,
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

    // Validar se é realmente uma imagem (verificando header do arquivo)
    const validateImageFiles = async () => {
      const validationPromises = newFiles.map(file => validateImageMagicBytes(file));
      const results = await Promise.all(validationPromises);
      
      const invalidImages = results.filter(isValid => !isValid);
      if (invalidImages.length > 0) {
        toast.error('Arquivo corrompido ou inválido', {
          description: 'Um ou mais arquivos não são imagens válidas',
        });
        e.target.value = '';
        return false;
      }
      return true;
    };

    validateImageFiles().then(isValid => {
      if (!isValid) return;

      setImagens(prev => [...prev, ...newFiles]);

      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);

      toast.success(`${newFiles.length} imagem${newFiles.length > 1 ? 'ns' : ''} adicionada${newFiles.length > 1 ? 's' : ''}`);
      e.target.value = '';
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));

    if (previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));

    toast.info('Imagem removida');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações específicas
    if (!tipoDemanda) {
      toast.error('Tipo de demanda obrigatório', {
        description: 'Selecione um tipo de demanda antes de continuar',
      });
      return;
    }

    if (!descricao.trim()) {
      toast.error('Campo obrigatório: Descrição', {
        description: 'Preencha a descrição da demanda para continuar',
      });
      return;
    }

    if (!bairro.trim()) {
      toast.error('Campo obrigatório: Bairro', {
        description: 'Preencha o bairro do endereço',
      });
      return;
    }

    if (!logradouro.trim()) {
      toast.error('Campo obrigatório: Logradouro', {
        description: 'Preencha o nome da rua/avenida',
      });
      return;
    }

    if (!numero.trim()) {
      toast.error('Campo obrigatório: Número', {
        description: 'Preencha o número do endereço (ex: 5222)',
      });
      return;
    }

    if (!cidade.trim()) {
      toast.error('Campo obrigatório: Cidade', {
        description: 'Preencha a cidade do endereço',
      });
      return;
    }

    // Validação de imagens obrigatórias
    if (imagens.length === 0) {
      toast.error('Campo obrigatório: Imagens', {
        description: 'Adicione pelo menos uma imagem da ocorrência para criar a demanda',
      });
      return;
    }

    try {
      const logradouroCompleto = `${tipoLogradouro} ${logradouro}`.trim();

      // Converter número para inteiro 
      const numeroInt = parseInt(numero.trim(), 10);

      // Validar se número é válido
      if (isNaN(numeroInt) || numeroInt <= 0) {
        toast.error('Número inválido', {
          description: 'Digite um número válido (ex: 5222)',
        });
        return;
      }

      await createDemanda.mutateAsync({
        tipo: tipoDemanda as TipoDemanda,
        descricao: descricao.trim(),
        endereco: {
          logradouro: logradouroCompleto,
          cep: cep.replace(/\D/g, ''),
          bairro: bairro.trim(),
          numero: numeroInt,
          complemento: complemento.trim() || undefined,
          cidade: cidade.trim(),
          estado: estado as EstadoBrasil,
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
        <DialogHeader className="bg-[var(--global-accent)] py-6 px-6 rounded-t-lg relative overflow-hidden">
          {/* Grid de pontos decorativos */}
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

          {/* Elementos decorativos geométricos */}
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

        <form onSubmit={handleSubmit} className="space-y-6 p-6 max-h-[calc(95vh-140px)] overflow-y-auto" data-test="create-demanda-form"
        >
          <div className="space-y-4 p-4 bg-[var(--global-bg-select)] rounded-lg border border-[var(--global-border)]">
            <Label className="text-[var(--global-text-secondary)] text-base font-semibold flex items-center gap-2">
              <span className="text-red-500">*</span>
              Endereço do Ocorrido
            </Label>

            {/* Linha 1: CEP e Bairro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-[var(--global-text-primary)] text-sm font-medium">
                  CEP
                </Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    disabled={loadingCep}
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)] pr-10"
                    data-test="cep-input"
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--global-accent)]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Bairro
                </Label>
                <div className="relative">
                  <Input
                    id="bairro"
                    value={bairro}
                    onChange={(e) => {
                      setBairro(e.target.value);
                      setShowSugestoesBairro(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSugestoesBairro(false), 200)}
                    onFocus={() => {
                      if (sugestoesBairro.length > 0) {
                        setShowSugestoesBairro(true);
                      }
                    }}
                    placeholder="Digite o bairro"
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                    data-test="bairro-input"
                    required
                  />
                  {loadingBairro && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--global-accent)]" />
                    </div>
                  )}

                  {/* Dropdown de sugestões de bairro */}
                  {showSugestoesBairro && sugestoesBairro.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--global-border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {sugestoesBairro.map((sugestao, index) => (
                        <div
                          key={index}
                          onClick={() => selecionarBairro(sugestao)}
                          className="px-4 py-2 hover:bg-[var(--global-bg-select)] cursor-pointer transition-colors border-b border-[var(--global-border)] last:border-b-0"
                        >
                          <div className="font-medium text-[var(--global-text-primary)]">{sugestao.bairro}</div>
                          <div className="text-xs text-[var(--global-text-secondary)]">CEP: {viaCepService.formatarCep(sugestao.cep)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Linha 2: Tipo de Logradouro e Logradouro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tipoLogradouro" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Tipo
                </Label>
                <Select value={tipoLogradouro} onValueChange={setTipoLogradouro}>
                  <SelectTrigger
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)] cursor-pointer"
                    data-test="tipo-logradouro-select"
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent data-test="tipo-logradouro-options">
                    {TIPOS_LOGRADOURO.map((tipo) => (
                      <SelectItem
                        key={tipo}
                        value={tipo}
                        className="cursor-pointer"
                        data-test={`tipo-logradouro-option-\${tipo.toLowerCase()}`}
                      >
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="logradouro" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Logradouro
                </Label>
                <div className="relative">
                  <Input
                    id="logradouro"
                    value={logradouro}
                    onChange={(e) => {
                      setLogradouro(e.target.value);
                      setShowSugestoesLogradouro(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSugestoesLogradouro(false), 200)}
                    onFocus={() => {
                      if (sugestoesLogradouro.length > 0) {
                        setShowSugestoesLogradouro(true);
                      }
                    }}
                    placeholder="Nome da rua, avenida..."
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                    data-test="logradouro-input"
                    required
                  />
                  {loadingLogradouro && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--global-accent)]" />
                    </div>
                  )}

                  {/* Dropdown de sugestões de logradouro */}
                  {showSugestoesLogradouro && sugestoesLogradouro.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--global-border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {sugestoesLogradouro.map((sugestao, index) => (
                        <div
                          key={index}
                          onClick={() => selecionarLogradouro(sugestao)}
                          className="px-4 py-3 hover:bg-[var(--global-bg-select)] cursor-pointer transition-colors border-b border-[var(--global-border)] last:border-b-0"
                        >
                          <div className="font-medium text-[var(--global-text-primary)]">{sugestao.logradouro}</div>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs text-[var(--global-text-secondary)]">
                              Bairro: {sugestao.bairro}
                            </span>
                            <span className="text-xs text-[var(--global-text-secondary)]">
                              CEP: {viaCepService.formatarCep(sugestao.cep)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Linha 3: Número e Complemento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Número
                </Label>
                <Input
                  id="numero"
                  type="text"
                  inputMode="numeric"
                  value={numero}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setNumero(value);
                  }}
                  placeholder="Ex: 5222"
                  className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                  data-test="numero-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento" className="text-[var(--global-text-primary)] text-sm font-medium">
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, bloco..."
                  className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                  data-test="complemento-input"
                />
              </div>
            </div>

            {/* Linha 4: Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite a cidade"
                  className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                  data-test="cidade-input"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Estado
                </Label>
                <Select value={estado} onValueChange={setEstado} disabled>
                  <SelectTrigger
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)] cursor-pointer"
                    data-test="estado-select"
                  >
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent data-test="estado-options">
                    {ESTADOS_BRASIL.map((uf) => (
                      <SelectItem
                        key={uf}
                        value={uf}
                        className="cursor-pointer"
                        data-test={`estado-option-\${uf.toLowerCase()}`}
                      >
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="descricao" className="text-[var(--global-text-secondary)] text-base font-semibold flex items-center gap-2">
                <span className="text-red-500">*</span>
                Descrição
              </Label>
              <span className={cn(
                "text-xs font-medium",
                descricao.length > 500 ? "text-red-500" : "text-[var(--global-text-primary)]"
              )}>
                {descricao.length}/500
              </span>
            </div>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o problema encontrado..."
              maxLength={500}
              className={cn(
                "min-h-[120px] resize-none border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]",
                descricao.length > 500 && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              data-test="descricao-textarea"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[var(--global-text-secondary)] text-base font-semibold flex items-center gap-2">
                <span className="text-red-500">*</span>
                Imagens
              </Label>
              <span className="text-xs text-[var(--global-text-primary)]">
                {previewUrls.length}/3 imagens
              </span>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3" data-test="images-preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-[var(--global-border)] group" data-test={`image-preview-container-\${index}`}>
                    <Image
                      src={url}
                      alt={`Preview \${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 200px"
                      data-test={`image-preview-\${index}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 cursor-pointer"
                      data-test={`remove-image-button-\${index}`}
                      aria-label={`Remover imagem \${index + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <label
                htmlFor="imagem"
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer transition-all font-medium shadow-md",
                  previewUrls.length < 3
                    ? "bg-[var(--global-accent)] hover:shadow-lg hover:brightness-110 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                <span className="text-sm text-[var(--global-text-primary)] font-medium" data-test="images-count">
                  {previewUrls.length} imagem{previewUrls.length > 1 ? 'ns' : ''} adicionada{previewUrls.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--global-text-primary)]">
              <span className="text-red-500 font-semibold">*</span> Obrigatório: mínimo 1 imagem • Máximo de 3 imagens • Tamanho máximo: 5MB por imagem
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--global-border)]">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={createDemanda.isPending}
              className="flex-1 border-2 border-[var(--global-border)] bg-white text-[var(--global-text-primary)] hover:bg-[var(--global-bg-select)] font-medium"
              data-test="cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createDemanda.isPending}
              className={cn(
                "flex-1 bg-[var(--global-accent)] hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all",
                createDemanda.isPending && "opacity-70 cursor-not-allowed"
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
      </DialogContent>
    </Dialog>
  );
}
