'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Info } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secretariaService } from '@/services/secretariaService';
import { useCreateColaborador } from '@/hooks/useCreateColaborador';
import { useCepVilhena } from '@/hooks/useCepVilhena';
import { createColaboradorSchema, type CreateColaboradorFormValues } from '@/lib/validations/colaborador';
import type { Secretaria, Usuarios, CreateUsuariosData } from '@/types';

interface CreateColaboradorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuarios | null;
}

export function CreateColaboradorModal({ open, onOpenChange, usuario }: CreateColaboradorModalProps) {
  const { buscarCep, formatarCep, validarCepEncontrado } = useCepVilhena();
  const [loadingCep, setLoadingCep] = useState(false);
  const [secretariasSelecionadas, setSecretariasSelecionadas] = useState<string[]>([]);

  const { createColaborador, isCreating } = useCreateColaborador({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      setSecretariasSelecionadas([]);
    },
  });

  const form = useForm<CreateColaboradorFormValues>({
    resolver: zodResolver(createColaboradorSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      celular: '',
      cnh: '',
      data_nascimento: '',
      cargo: '',
      portaria_nomeacao: '',
      formacao: '',
      nivel_acesso: 'operador',
      ativo: true,
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Vilhena',
        estado: 'RO',
      },
      secretarias: [],
    },
  });

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

  // Auto-exibir erros de validação
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0 && form.formState.isSubmitted && !form.formState.isSubmitting) {
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error('Erro de validação', {
          description: firstError.message,
        });
      }
    }
  }, [form.formState.submitCount, form.formState.errors, form.formState.isSubmitted, form.formState.isSubmitting]);

  // Resetar form quando modal fechar
  useEffect(() => {
    if (!open) {
      form.reset();
      setSecretariasSelecionadas([]);
    }
  }, [open, form]);

  const toggleSecretaria = (id: string) => {
    setSecretariasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)
    );
  };

  const onSubmit = (data: CreateColaboradorFormValues) => {
    const cepValidation = validarCepEncontrado(data.endereco.cep);
    if (!cepValidation.valid) {
      toast.error('Erro de validação', {
        description: cepValidation.message || 'CEP inválido',
      });
      return;
    }

    let dataNascimentoBR = data.data_nascimento;
    if (/^\d{4}-\d{2}-\d{2}$/.test(data.data_nascimento)) {
      const [ano, mes, dia] = data.data_nascimento.split('-');
      dataNascimentoBR = `${dia}/${mes}/${ano}`;
    }

    const payload = {
      ...data,
      celular: data.celular.replace(/\D/g, ''),
      cpf: data.cpf.replace(/\D/g, ''),
      cnh: data.cnh && data.cnh.trim() ? data.cnh.replace(/\D/g, '') : undefined,
      data_nascimento: dataNascimentoBR,
      senha: 'Temp@123',
      nivel_acesso: {
        municipe: false,
        operador: data.nivel_acesso === 'operador',
        secretario: data.nivel_acesso === 'secretario',
        administrador: data.nivel_acesso === 'administrador',
      },
      endereco: {
        ...data.endereco,
        numero: parseInt(data.endereco.numero, 10),
        cidade: 'Vilhena',
        estado: 'RO' as const,
      },
      secretarias: secretariasSelecionadas.length ? secretariasSelecionadas : undefined,
      cargo: data.cargo?.trim() || undefined,
      formacao: data.formacao?.trim() || undefined,
      portaria_nomeacao: data.portaria_nomeacao?.trim() || undefined,
    };

    createColaborador(payload as CreateUsuariosData);
  };

  const handleCepChange = async (value: string, onChange: (value: string) => void) => {
    const formatted = formatarCep(value);
    onChange(formatted);

    const apenasNumeros = formatted.replace(/\D/g, '');
    if (apenasNumeros.length === 8) {
      setLoadingCep(true);
      try {
        const endereco = await buscarCep(apenasNumeros);
        
        if (endereco) {
          form.setValue('endereco.bairro', endereco.bairro || '');
          if (endereco.logradouro) {
            form.setValue('endereco.logradouro', endereco.logradouro);
          }
        }
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isCreating) onOpenChange(o); }} data-test="dialog-criar-colaborador">
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border-none shadow-2xl" data-test="dialog-content-criar-colaborador">
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
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {usuario ? 'Editar Colaborador' : 'Adicionar Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-test="formulario-criar-colaborador">
              {/* Banner informativo sobre email */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-test="banner-info-email">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Definição de Senha:</strong> Após cadastrar o colaborador, um email será enviado automaticamente com um link para que ele defina sua própria senha de acesso ao sistema.
                  </p>
                </div>
              </div>

              {/* Dados pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem data-test="campo-nome-wrapper">
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nome completo" 
                          disabled={isCreating}
                          data-test="input-nome"
                        />
                      </FormControl>
                      <FormMessage data-test="erro-nome" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem data-test="campo-email-wrapper">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="email@prefeitura.gov.br" 
                          disabled={isCreating}
                          data-test="input-email"
                        />
                      </FormControl>
                      <FormMessage data-test="erro-email" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Documentos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem data-test="campo-cpf-wrapper">
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="00000000000" 
                          disabled={isCreating}
                          data-test="input-cpf"
                          maxLength={11}
                        />
                      </FormControl>
                      <FormMessage data-test="erro-cpf" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem data-test="campo-celular-wrapper">
                      <FormLabel>Celular *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="(69) 99999-9999" 
                          disabled={isCreating}
                          data-test="input-celular"
                          maxLength={11}
                        />
                      </FormControl>
                      <FormMessage data-test="erro-celular" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnh"
                  render={({ field }) => (
                    <FormItem data-test="campo-cnh-wrapper">
                      <FormLabel>CNH</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="12345678901" 
                          disabled={isCreating}
                          data-test="input-cnh"
                          maxLength={11}
                        />
                      </FormControl>
                      <FormMessage data-test="erro-cnh" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Data de Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="data_nascimento"
                  render={({ field }) => (
                    <FormItem data-test="campo-data-nascimento-wrapper">
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          disabled={isCreating}
                          data-test="input-data-nascimento"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage data-test="erro-data-nascimento" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Informações profissionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="cargo"
                  render={({ field }) => (
                    <FormItem data-test="campo-cargo-wrapper">
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Analista" 
                          disabled={isCreating}
                          data-test="input-cargo"
                        />
                      </FormControl>
                      <FormMessage data-test="erro-cargo" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portaria_nomeacao"
                  render={({ field }) => (
                    <FormItem data-test="campo-portaria-wrapper">
                      <FormLabel>Portaria</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="PORTARIA/123" 
                          disabled={isCreating}
                          data-test="input-portaria"
                        />
                      </FormControl>
                      <FormMessage data-test="erro-portaria" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formacao"
                  render={({ field }) => (
                    <FormItem data-test="campo-formacao-wrapper">
                      <FormLabel>Formação</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Ciência da Computação" 
                          disabled={isCreating}
                          data-test="input-formacao"
                        />
                      </FormControl>
                      <FormMessage data-test="erro-formacao" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Nível de acesso e status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="nivel_acesso"
                  render={({ field }) => (
                    <FormItem data-test="campo-nivel-acesso-wrapper">
                      <FormLabel>Nível de acesso *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isCreating}
                      >
                        <FormControl>
                          <SelectTrigger data-test="select-nivel-acesso">
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="operador" data-test="option-operador">Operador</SelectItem>
                          <SelectItem value="secretario" data-test="option-secretario">Secretário</SelectItem>
                          <SelectItem value="administrador" data-test="option-administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage data-test="erro-nivel-acesso" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem data-test="campo-ativo-wrapper">
                      <FormLabel>Status</FormLabel>
                      <div className="flex items-center gap-3 h-9">
                        <FormControl>
                          <Checkbox 
                            id="ativo"
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            disabled={isCreating}
                            data-test="checkbox-ativo"
                          />
                        </FormControl>
                        <FormLabel htmlFor="ativo" className="cursor-pointer !mt-0">
                          Ativo
                        </FormLabel>
                      </div>
                      <FormMessage data-test="erro-ativo" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-3">
                <FormLabel className="text-base font-semibold">Endereço</FormLabel>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="endereco.cep"
                    render={({ field }) => (
                      <FormItem data-test="campo-cep-wrapper">
                        <FormLabel>CEP *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field}
                              placeholder="00000-000" 
                              onChange={(e) => handleCepChange(e.target.value, field.onChange)}
                              disabled={isCreating || loadingCep}
                              maxLength={9}
                              className="pr-10"
                              data-test="input-cep"
                            />
                            {loadingCep && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-global-accent" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage data-test="erro-cep" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.logradouro"
                    render={({ field }) => (
                      <FormItem data-test="campo-logradouro-wrapper">
                        <FormLabel>Logradouro *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Rua, Avenida..." 
                            disabled={isCreating}
                            data-test="input-logradouro"
                          />
                        </FormControl>
                        <FormMessage data-test="erro-logradouro" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.numero"
                    render={({ field }) => (
                      <FormItem data-test="campo-numero-wrapper">
                        <FormLabel>Número *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="123" 
                            disabled={isCreating}
                            data-test="input-numero"
                          />
                        </FormControl>
                        <FormMessage data-test="erro-numero" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="endereco.complemento"
                    render={({ field }) => (
                      <FormItem data-test="campo-complemento-wrapper">
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Apto, Bloco..." 
                            disabled={isCreating}
                            data-test="input-complemento"
                          />
                        </FormControl>
                        <FormMessage data-test="erro-complemento" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.bairro"
                    render={({ field }) => (
                      <FormItem data-test="campo-bairro-wrapper">
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Bairro" 
                            disabled={isCreating}
                            data-test="input-bairro"
                          />
                        </FormControl>
                        <FormMessage data-test="erro-bairro" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.cidade"
                    render={({ field }) => (
                      <FormItem data-test="campo-cidade-wrapper">
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled 
                            readOnly
                            className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            data-test="input-cidade"
                          />
                        </FormControl>
                        <FormMessage data-test="erro-cidade" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <FormField
                    control={form.control}
                    name="endereco.estado"
                    render={({ field }) => (
                      <FormItem data-test="campo-estado-wrapper" className="md:col-span-2">
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled 
                            readOnly
                            className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            data-test="input-estado"
                          />
                        </FormControl>
                        <FormMessage data-test="erro-estado" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Secretarias */}
              <div className="space-y-2">
                <FormLabel className="text-base font-semibold">Secretarias</FormLabel>
                <div className="rounded-md border border-global-border p-3 max-h-48 overflow-auto bg-white" data-test="lista-secretarias">
                  {isLoadingSecretarias ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando secretarias...
                    </div>
                  ) : secretarias.length === 0 ? (
                    <div className="text-sm text-gray-500">Nenhuma secretaria encontrada.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {secretarias.map((s) => (
                        <label 
                          key={s._id} 
                          className="flex items-center gap-2 text-sm text-global-text-primary cursor-pointer"
                          data-test={`label-secretaria-${s._id}`}
                        >
                          <Checkbox 
                            checked={secretariasSelecionadas.includes(s._id)} 
                            onCheckedChange={() => toggleSecretaria(s._id)}
                            disabled={isCreating}
                            data-test={`checkbox-secretaria-${s._id}`}
                          />
                          <span>{s.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-2 border-global-border bg-white text-global-text-primary hover:bg-global-bg-select font-medium"
                  disabled={isCreating}
                  data-test="button-cancelar"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-global-accent hover:brightness-110 hover:shadow-lg text-white font-semibold transition-all"
                  data-test="button-criar-colaborador"
                >
                  {isCreating ? (
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
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
