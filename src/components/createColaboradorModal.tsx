'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secretariaService } from '@/services/secretariaService';
import { usuarioService } from '@/services/usuarioService';
import type { CreateUsuariosData, Secretaria, Usuarios, EstadoBrasil } from '@/types';
import { ESTADOS_BRASIL } from '@/types';

interface CreateColaboradorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateColaboradorModal({ open, onOpenChange }: CreateColaboradorModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [celular, setCelular] = useState('');
  const [cargo, setCargo] = useState('');
  const [portaria, setPortaria] = useState('');
  const [formacao, setFormacao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [cnh, setCnh] = useState('');

  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const [nivel, setNivel] = useState<'operador' | 'secretario' | 'administrador' | ''>('');

  const [secretariasSelecionadas, setSecretariasSelecionadas] = useState<string[]>([]);

  const { data: secretariasAll, isLoading: isLoadingSecretarias } = useQuery({
    queryKey: ['secretarias', 'all-for-colaborador', open],
    enabled: open,
    queryFn: async () => {
      let allDocs: Secretaria[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await secretariaService.buscarSecretarias({}, 50, page);
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

  const secretarias: Secretaria[] = useMemo(() => Array.isArray(secretariasAll) ? secretariasAll : [], [secretariasAll]);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setNome('');
      setEmail('');
      setCpf('');
      setCelular('');
      setCargo('');
      setPortaria('');
      setFormacao('');
      setAtivo(true);
      setCnh('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCep('');
      setCidade('');
      setEstado('');
      setNivel('');
      setSecretariasSelecionadas([]);
    }
  }, [open]);

  const toggleSecretaria = (id: string) => {
    setSecretariasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nome.trim()) return toast.error('Informe o nome');
    if (!email.trim()) return toast.error('Informe o email');
    if (!cpf.trim()) return toast.error('Informe o CPF');
    if (!cnh.trim()) return toast.error('Informe a CNH');
    if (!nivel) return toast.error('Selecione o nível de acesso');

    setIsSubmitting(true);
    try {
      const numeroParsed = parseInt((numero || '').toString(), 10);
      if (Number.isNaN(numeroParsed)) {
        toast.error('Informe um número de endereço válido');
        setIsSubmitting(false);
        return;
      }

      const estadoUf = (estado || '').toUpperCase() as EstadoBrasil;
      if (!ESTADOS_BRASIL.includes(estadoUf)) {
        toast.error('Estado inválido (use UF, ex: RO)');
        setIsSubmitting(false);
        return;
      }

      const celularNumeros = (celular || '').replace(/\D/g, '');
      if (celularNumeros.length !== 11) {
        toast.error('O celular deve conter 11 dígitos (ex: (69)999999999)');
        setIsSubmitting(false);
        return;
      }
      const payload: CreateUsuariosData = {
        cpf: cpf.trim(),
        email: email.trim(),
        celular: celularNumeros,
        cnh: cnh.trim(),
        data_nomeacao: undefined,
        cargo: cargo || undefined,
        formacao: formacao || undefined,
        link_imagem: undefined,
        nivel_acesso: {
          municipe: false,
          operador: nivel === 'operador',
          secretario: nivel === 'secretario',
          administrador: nivel === 'administrador',
        },
        nome: nome.trim(),
        ativo,
        nome_social: undefined,
        portaria_nomeacao: portaria || undefined,
        endereco: {
          logradouro: logradouro || '',
          cep: cep || '',
          bairro: bairro || '',
          numero: numeroParsed,
          complemento: complemento || '',
          cidade: cidade || '',
          estado: estadoUf,
        },
        secretarias: secretariasSelecionadas.length ? secretariasSelecionadas : undefined,
      };

      await usuarioService.criarUsuario(payload as unknown as Usuarios as any);

      toast.success('Colaborador criado com sucesso!');
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar colaborador';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl">
        <DialogHeader className="bg-[var(--global-accent)] py-6 px-6 rounded-t-lg">
          <DialogTitle className="text-2xl font-bold text-center text-white">Adicionar Colaborador</DialogTitle>
          <DialogDescription className="text-white/90 text-center">Preencha os dados do colaborador</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@prefeitura.gov.br" required disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="00000000000" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Celular</Label>
              <Input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="(69) 99999-9999" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>CNH</Label>
              <Input type="text" value={cnh} onChange={(e) => setCnh(e.target.value)} placeholder="12345678901" required disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Designer" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Portaria</Label>
              <Input value={portaria} onChange={(e) => setPortaria(e.target.value)} placeholder="PORTARIA/123" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label>Formação</Label>
              <Input value={formacao} onChange={(e) => setFormacao(e.target.value)} placeholder="Dados" disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nível de acesso</Label>
              <Select value={nivel} onValueChange={(v) => setNivel(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="secretario">Secretário</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 h-9">
                <Checkbox id="ativo" checked={ativo} onCheckedChange={(v) => setAtivo(Boolean(v))} />
                <Label htmlFor="ativo" className="cursor-pointer">Ativo</Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Endereço</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} disabled={isSubmitting} className="md:col-span-2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secretarias</Label>
            <div className="rounded-md border border-[var(--global-border)] p-3 max-h-48 overflow-auto bg-white">
              {isLoadingSecretarias ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando secretarias...
                </div>
              ) : secretarias.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma secretaria encontrada.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {secretarias.map((s) => (
                    <label key={s._id} className="flex items-center gap-2 text-sm text-[var(--global-text-primary)] cursor-pointer">
                      <Checkbox checked={secretariasSelecionadas.includes(s._id)} onCheckedChange={() => toggleSecretaria(s._id)} />
                      <span>{s.nome}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-[var(--global-border)] bg-white text-[var(--global-text-primary)] hover:bg-[var(--global-bg-select)] font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[var(--global-accent)] hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Criar Colaborador
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


