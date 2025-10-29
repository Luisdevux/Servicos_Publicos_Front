// src/components/createSecretariaModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { tipoDemandaService } from '@/services';
import type { TipoDemandaModel } from '@/types';
import { CreateTipoDemandaModal } from '@/components/createTipoDemandaModal';

interface CreateSecretariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;  
}

export function CreateSecretariaModal({ open, onOpenChange }: CreateSecretariaModalProps) {
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipo, setTipo] = useState('');
  const [tiposUnicos, setTiposUnicos] = useState<string[]>([]);
  const [isCreateTipoOpen, setIsCreateTipoOpen] = useState(false);

  const { data: tiposDemandaData, isLoading: isLoadingTipos, refetch: refetchTipos } = useQuery({
    queryKey: ['tipoDemanda', 'all'],
    queryFn: async () => {
      let allDocs: TipoDemandaModel[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const res = await tipoDemandaService.buscarTiposDemandaPorTipo({}, 10, page);
        const data = res.data;
        
        if (data?.docs) {
          allDocs = [...allDocs, ...data.docs];
        }
        
        totalPages = data?.totalPages || 1;
        page++;
      } while (page <= totalPages);

      return allDocs;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, 
    retry: 1,
  });

  useEffect(() => {
    if (tiposDemandaData) {
      const tiposSet = new Set<string>();
      tiposDemandaData.forEach((item) => {
        if (item?.tipo && item.tipo.trim()) {
          tiposSet.add(item.tipo.trim());
        }
      });
      setTiposUnicos(Array.from(tiposSet).sort());
    }
  }, [tiposDemandaData]);

  const isFormValid = nome.trim() && sigla.trim() && email.trim() && telefone.trim() && tipo.trim();

  useEffect(() => {
    if (!open) {
      setNome('');
      setSigla('');
      setEmail('');
      setTelefone('');
      setTipo('');
    }
  }, [open]);

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen && isCreateTipoOpen) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange} modal>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl"
        data-test="create-secretaria-dialog"
      >
        <DialogHeader className="bg-[var(--global-accent)] py-6 px-6 rounded-t-lg relative overflow-hidden">
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
            data-test="create-secretaria-title"
          >
            Adicionar Nova Secretaria
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6 p-6 max-h-[calc(95vh-140px)] overflow-y-auto" data-test="create-secretaria-form">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                <span className="text-red-500">*</span>
                  Nome
                </Label>
                <div className="relative">
                  <Input
                    id="nomeSecretaria"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Secretaria Municipal de Iluminação Pública"
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)] pr-10"
                    type='text'
                    required
                    data-test="nome-secretaria-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Sigla
                </Label>
                <div className="relative">
                  <Input
                    id="siglaSecretaria"
                    value={sigla}
                    onChange={(e) => setSigla(e.target.value)}
                    placeholder="SEMILU"
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                    required
                    type='text'
                    data-test="sigla-secretaria-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="emailSecretaria" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="emailSecretaria"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="iluminacao@prefeitura.gov.br"
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                    type='email'
                    required
                    data-test="email-secretaria-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefoneSecretaria" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Telefone
                </Label>
                <div className="relative">
                  <Input
                    id="telefoneSecretaria"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(69) 99999-9999"
                    type='tel'
                    className="border-[var(--global-border)] focus:border-[var(--global-accent)] focus:ring-[var(--global-accent)]"
                    required
                    data-test="telefone-secretaria-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-[var(--global-text-primary)] text-sm font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Tipo de Secretaria
                </Label>
                <Select
                  value={tipo || ''}
                  onValueChange={setTipo}
                  disabled={isLoadingTipos}
                >
                  <SelectTrigger data-test="tipo-secretaria-select">
                    <SelectValue placeholder={isLoadingTipos ? 'Carregando tipos...' : 'Selecione o tipo de secretaria'} />
                  </SelectTrigger>
                  <SelectContent data-test="tipo-secretaria-options">
                    {isLoadingTipos ? (
                      <div className="flex items-center justify-center p-4" data-test="tipo-secretaria-loading">
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--global-accent)]" />
                      </div>
                    ) : (
                      <>
                        {tiposUnicos.length > 0 && tiposUnicos.map((tipoOption) => (
                          <SelectItem 
                            key={tipoOption} 
                            value={tipoOption}
                            data-test={`tipo-secretaria-option-${tipoOption.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {tipoOption}
                          </SelectItem>
                        ))}
                        <div className="border-t border-[var(--global-border)]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsCreateTipoOpen(true);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                            className="w-full px-2 py-1.5 text-sm text-[var(--global-accent)] hover:bg-[var(--global-bg-select)] cursor-pointer transition-colors flex items-center gap-2"
                            data-test="tipo-demanda-option-novo"
                          >
                            <span className="font-medium">+</span>
                            <span>Adicionar novo tipo</span>
                          </button>
                        </div>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>


          <div className="flex gap-3 pt-4 ">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-[var(--global-border)] bg-white text-[var(--global-text-primary)] hover:bg-[var(--global-bg-select)] font-medium"
              data-test="cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className={cn(
                "flex-1 bg-[var(--global-accent)] hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all",
                !isFormValid && "opacity-70 cursor-not-allowed"
              )}
              data-test="submit-button"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Criar Secretaria
            </Button>
          </div>
        </form>
      </DialogContent>

      <CreateTipoDemandaModal
        open={isCreateTipoOpen}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setIsCreateTipoOpen(false);
            void refetchTipos();
          }
        }}
      />
    </Dialog>
  );
}
