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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secretariaService } from '@/services/secretariaService';
import { usuarioService } from '@/services/usuarioService';
import { useCepVilhena } from '@/hooks/useCepVilhena';
import { validateIdentificador } from '@/lib/validations/auth';
import type { CreateUsuariosData, Secretaria, Usuarios, EstadoBrasil } from '@/types';
import type { Endereco } from '@/types/endereco';

interface CreateColaboradorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuarios | null;
}

export function CreateColaboradorModal({ open, onOpenChange, usuario }: CreateColaboradorModalProps) {
  const queryClient = useQueryClient();
  const { buscarCep, formatarCep, validarCepEncontrado } = useCepVilhena();
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
  const [loadingCep, setLoadingCep] = useState(false);

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
    if (open && usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setCpf(usuario.cpf || '');
      setCelular(usuario.celular || '');
      setCargo(usuario.cargo || '');
      setPortaria(usuario.portaria_nomeacao || '');
      setFormacao(usuario.formacao || '');
      setAtivo(Boolean(usuario.ativo));
      setCnh(usuario.cnh || '');
      setLogradouro(usuario.endereco?.logradouro || '');
      setNumero(String(usuario.endereco?.numero ?? ''));
      setComplemento(usuario.endereco?.complemento || '');
      setBairro(usuario.endereco?.bairro || '');
      setCep(usuario.endereco?.cep || '');
      setCidade(usuario.endereco?.cidade || '');
      setEstado((usuario.endereco?.estado as string) || '');
      setNivel(
        usuario.nivel_acesso?.administrador
          ? 'administrador'
          : usuario.nivel_acesso?.secretario
            ? 'secretario'
            : usuario.nivel_acesso?.operador
              ? 'operador'
              : ''
      );
      let idsSecretarias: string[] = [];
      const sec = usuario.secretarias as unknown;
      if (Array.isArray(sec)) {
        if (sec.length > 0 && typeof sec[0] === 'string') {
          idsSecretarias = sec as unknown as string[];
        } else {
          idsSecretarias = sec.map((x) => x?._id).filter(Boolean);
        }
      }
      setSecretariasSelecionadas(idsSecretarias);
    }
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open, usuario]);

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
    
    // Validar CPF
    const cpfValidation = validateIdentificador(cpf.trim());
    if (!cpfValidation.isValid) {
      toast.error(cpfValidation.message || 'CPF inválido');
      setIsSubmitting(false);
      return;
    }
    
    if (!cnh.trim()) return toast.error('Informe a CNH');
    if (!nivel) return toast.error('Selecione o nível de acesso');

    // Validar CEP de Vilhena, verifica se está no range e se foi encontrado no ViaCEP
    const cepValidation = validarCepEncontrado(cep);
    if (!cepValidation.valid) {
      toast.error(cepValidation.message || 'CEP inválido');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const numeroParsed = parseInt((numero || '').toString(), 10);
      if (Number.isNaN(numeroParsed)) {
        toast.error('Informe um número de endereço válido');
        setIsSubmitting(false);
        return;
      }

      // Estado sempre será RO (Rondônia) - não precisa validar
      
      const celularNumeros = (celular || '').replace(/\D/g, '');
      if (celularNumeros.length !== 11) {
        toast.error('O celular deve conter 11 dígitos (69)999999999');
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
          cidade: 'Vilhena', // Sempre Vilhena
          estado: 'RO' as EstadoBrasil, // Sempre RO
        },
        secretarias: secretariasSelecionadas.length ? secretariasSelecionadas : undefined,
      };

      if (usuario?._id) {
        const updatePayload: Record<string, unknown> = {};
        if (payload.nome !== usuario.nome) updatePayload.nome = payload.nome;
        if (payload.celular !== usuario.celular) updatePayload.celular = payload.celular;
        if (payload.cargo !== usuario.cargo) updatePayload.cargo = payload.cargo;
        if (payload.formacao !== usuario.formacao) updatePayload.formacao = payload.formacao;
        if (payload.ativo !== usuario.ativo) updatePayload.ativo = payload.ativo;
        if (payload.portaria_nomeacao !== usuario.portaria_nomeacao) updatePayload.portaria_nomeacao = payload.portaria_nomeacao;

        // endereço: se qualquer campo mudou, envia o objeto completo
        const currentEnd: Partial<Endereco> = usuario.endereco || {};
        const newEnd = payload.endereco;
        const addressChanged = (
          (newEnd?.logradouro || '') !== (currentEnd.logradouro || '') ||
          (newEnd?.cep || '') !== (currentEnd.cep || '') ||
          (newEnd?.bairro || '') !== (currentEnd.bairro || '') ||
          (newEnd?.numero || 0) !== (currentEnd.numero || 0) ||
          (newEnd?.complemento || '') !== (currentEnd.complemento || '') ||
          (newEnd?.cidade || '') !== (currentEnd.cidade || '') ||
          (newEnd?.estado || '') !== (currentEnd.estado || '')
        );
        if (addressChanged) {
          updatePayload.endereco = newEnd;
        }

        // secretarias: compara ids
        let currentSecIds: string[] = [];
        const sec = usuario.secretarias as unknown;
        if (Array.isArray(sec)) {
          if (sec.length > 0 && typeof sec[0] === 'string') currentSecIds = sec as unknown as string[];
          else currentSecIds = sec.map((x) => x?._id).filter(Boolean);
        }
        const nextSecIds = secretariasSelecionadas;
        const setsEqual = currentSecIds.length === nextSecIds.length && currentSecIds.every((id) => nextSecIds.includes(id));
        if (!setsEqual) {
          updatePayload.secretarias = nextSecIds;
        }

        if (Object.keys(updatePayload).length === 0) {
          toast.info('Nenhuma alteração para salvar.');
          onOpenChange(false);
          return;
        }
        await usuarioService.atualizarUsuario(usuario._id!, updatePayload);
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        await usuarioService.criarUsuario(payload);
        toast.success('Colaborador criado com sucesso!');
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
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      onOpenChange(false);
    } catch (error) {
      const defaultMsg = error instanceof Error ? error.message : 'Erro ao criar colaborador';
      const data = (error as { data?: unknown })?.data;
      const errors = Array.isArray((data as { errors?: unknown[] })?.errors) ? (data as { errors: unknown[] }).errors : [];
      if (errors.length > 0) {
        errors.forEach((err: unknown) => {
          const msg = typeof (err as { message?: unknown })?.message === 'string' ? (err as { message: string }).message : defaultMsg;
          toast.error(msg);
        });
      } else {
        toast.error(defaultMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCep(e.target.value);
    setCep(formatted);

    const apenasNumeros = formatted.replace(/\D/g, '');
    if (apenasNumeros.length === 8) {
      setLoadingCep(true);
      try {
        const endereco = await buscarCep(apenasNumeros);
        
        if (endereco) {
          setBairro(endereco.bairro || '');
          // Cidade e Estado são fixos em Vilhena/RO - não devem ser alterados
          // setCidade e setEstado removidos para garantir que sempre sejam Vilhena/RO
          if (endereco.logradouro) {
            setLogradouro(endereco.logradouro);
          }
        }
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl">
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
          <DialogTitle className="text-2xl font-bold text-center text-white">{usuario ? 'Editar Colaborador' : 'Adicionar Colaborador'}</DialogTitle>
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
              <Select value={nivel} onValueChange={(v) => setNivel(v as 'operador' | 'secretario' | 'administrador' | '')}>
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
              <div className="relative">
                <Input
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  disabled={isSubmitting || loadingCep}
                  maxLength={9}
                  className="pr-10"
                />
                {loadingCep && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-global-accent" />
                  </div>
                )}
              </div>
              <Input placeholder="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={isSubmitting} />
              <Input placeholder="Cidade" value={cidade || 'Vilhena'} disabled readOnly className="bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input placeholder="Estado" value={estado || 'RO'} disabled readOnly className="md:col-span-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secretarias</Label>
            <div className="rounded-md border border-global-border p-3 max-h-48 overflow-auto bg-white">
              {isLoadingSecretarias ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando secretarias...
                </div>
              ) : secretarias.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma secretaria encontrada.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {secretarias.map((s) => (
                    <label key={s._id} className="flex items-center gap-2 text-sm text-global-text-primary cursor-pointer">
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
                  {usuario ? 'Salvar alterações' : 'Criar Colaborador'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


