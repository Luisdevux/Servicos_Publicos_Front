// src/components/createSecretariaModal.tsx

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl"  
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
          >
            Adicionar Nova Secretaria
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-6 p-6 max-h-[calc(95vh-140px)] overflow-y-auto"
        >
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
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de secretaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iluminação Pública">Iluminação Pública</SelectItem>
                    <SelectItem value="Saneamento Básico">Saneamento Básico</SelectItem>
                    <SelectItem value="Limpeza Pública">Limpeza Pública</SelectItem>
                    <SelectItem value="Segurança Pública">Segurança Pública</SelectItem>
                    <SelectItem value="Outros">+ Adicionar Outro Tipo</SelectItem>
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
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Criar Secretaria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
