// src/components/CadastroForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Calendar, Check, X, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { signupSchema, type SignupFormData } from '@/lib/validations/signup';
import { signup } from '@/services/authService';
import { useCepVilhena } from '@/hooks/useCepVilhena';
import { formatCPF, formatPhoneNumber, validateCPF } from '@/lib/profileHelpers';

export default function CadastroForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const router = useRouter();
  const { buscarCep, formatarCep, cepEncontrado } = useCepVilhena();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      data_nascimento: '',
      cpf: '',
      celular: '',
      nome_social: '',
      endereco: {
        logradouro: '',
        cep: '',
        bairro: '',
        numero: 1,
        complemento: '',
        cidade: 'Vilhena',
        estado: 'RO',
      },
    },
  });

  // Mutation para cadastro
  const cadastroMutation = useMutation({
    mutationFn: signup,
    onSuccess: (_, variables) => {
      toast.success('Cadastro realizado com sucesso!', {
        description: 'Enviamos um link de verificação para seu email.',
        duration: 5000,
      });
      
      // Redireciona para página de instruções, passando o email
      setTimeout(() => {
        const email = encodeURIComponent(variables.email);
        router.push(`/aguardando-verificacao?email=${email}`);
      }, 1500);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      let message = 'Erro ao realizar cadastro. Tente novamente.';
      
      if (error?.data?.message) {
        message = error.data.message;
        
        if (error?.data?.errors && Array.isArray(error.data.errors) && error.data.errors.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detalhes = error.data.errors.map((e: any) => `${e.path}: ${e.message}`).join(' | ');
          message = `${message} Detalhes: ${detalhes}`;
        }
      } else if (error?.message) {
        message = error.message;
      }
      
      toast.error('Erro no cadastro', {
        description: message,
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    const [ano, mes, dia] = data.data_nascimento.split('-');
    const dataFormatted = `${dia}/${mes}/${ano}`;

    const cpfLimpo = data.cpf.replace(/\D/g, '');
    const celularLimpo = data.celular.replace(/\D/g, '');
    const cepLimpo = data.endereco.cep.replace(/\D/g, '');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmarSenha, ...dadosSemConfirmacao } = data;

    const payload = {
      ...dadosSemConfirmacao,
      data_nascimento: dataFormatted,
      cpf: cpfLimpo,
      celular: celularLimpo,
      endereco: {
        ...data.endereco,
        cep: cepLimpo,
      },
    };

    // Remove campos opcionais vazios (nome_social e complemento)
    if (!payload.nome_social || payload.nome_social.trim() === '') {
      delete payload.nome_social;
    }
    if (!payload.endereco.complemento || payload.endereco.complemento.trim() === '') {
      delete payload.endereco.complemento;
    }
    
    cadastroMutation.mutate(payload);
  };

  const cpfValue = form.watch('cpf');
  useEffect(() => {
    if (cpfValue && cpfValue.replace(/\D/g, '').length === 11) {
      const validation = validateCPF(cpfValue);
      setCpfValido(validation.valid);
    } else {
      setCpfValido(null);
    }
  }, [cpfValue]);

  // Buscar CEP automaticamente — apenas quando o CEP estiver completo (8 dígitos)
  const cepValue = form.watch('endereco.cep');
  useEffect(() => {
    const cepLimpo = cepValue?.replace(/\D/g, '') || '';

    if (cepLimpo.length === 8 && cepLimpo !== cepEncontrado) {
      // chamar com cepLimpo (sem máscara)
      buscarCep(cepLimpo).then((endereco) => {
        if (endereco) {
          form.setValue('endereco.logradouro', endereco.logradouro || '');
          form.setValue('endereco.bairro', endereco.bairro || '');
          form.setValue('endereco.cidade', endereco.cidade || 'Vilhena');
          form.setValue('endereco.estado', endereco.estado || 'RO');
        }
      }).catch(() => {
        // Erro já tratado no hook
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepValue, cepEncontrado]);

  // Requisitos de senha
  const senhaValue = form.watch('senha');
  const passwordRequirements = [
    { test: (senha: string) => senha.length >= 8, label: 'Mínimo 8 caracteres' },
    { test: (senha: string) => /[a-z]/.test(senha), label: '1 letra minúscula' },
    { test: (senha: string) => /[A-Z]/.test(senha), label: '1 letra maiúscula' },
    { test: (senha: string) => /\d/.test(senha), label: '1 número' },
    { test: (senha: string) => /[@$!%*?&]/.test(senha), label: '1 caractere especial (@$!%*?&)' },
  ];

  // Validação de confirmação de senha
  const confirmarSenhaValue = form.watch('confirmarSenha');
  const senhasCoincide = senhaValue && confirmarSenhaValue ? senhaValue === confirmarSenhaValue : null;

  // Exibir erros de validação via toast
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0 && form.formState.isSubmitted && !form.formState.isSubmitting) {
      const allErrors: string[] = [];
      
      for (const [key, error] of Object.entries(errors)) {
        if (error && typeof error === 'object' && 'message' in error) {
          const msg = (error as { message: string }).message;
          allErrors.push(`${key}: ${msg}`);
        }
        
        if (error && typeof error === 'object' && !('message' in error)) {
          for (const [subKey, subError] of Object.entries(error)) {
            if (subError && typeof subError === 'object' && 'message' in subError) {
              const msg = (subError as { message: string }).message;
              allErrors.push(`${key}.${subKey}: ${msg}`);
            }
          }
        }
      }
      
      if (allErrors.length > 0) {
        toast.error('Erro de validação', {
          description: allErrors.join(' | '),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.submitCount]);

  const isLoading = cadastroMutation.isPending;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-test="form-cadastro">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2" data-test="titulo-cadastro">
          Cadastro de Munícipe
        </h2>
        <p className="text-gray-600 text-sm" data-test="subtitulo-cadastro">
          Preencha seus dados para criar sua conta
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-test="formulario-cadastro" noValidate>
          
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dados Pessoais</h3>
            
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem data-test="campo-nome-wrapper">
                  <FormLabel className="text-sm font-medium text-gray-700">Nome completo *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input {...field} type="text" placeholder="João da Silva" disabled={isLoading} data-test="input-nome" className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome Social */}
            <FormField
              control={form.control}
              name="nome_social"
              render={({ field }) => (
                <FormItem data-test="campo-nome-social-wrapper">
                  <FormLabel className="text-sm font-medium text-gray-700">Nome social (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Como prefere ser chamado" disabled={isLoading} data-test="input-nome-social" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF e Data Nascimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem data-test="campo-cpf-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">CPF *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="000.000.000-00"
                          disabled={isLoading}
                          data-test="input-cpf"
                          className={`pl-10 ${cpfValido === false ? 'border-red-500' : cpfValido === true ? 'border-green-500' : ''}`}
                          maxLength={14}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                        {cpfValido !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {cpfValido ? (
                              <Check className="w-5 h-5 text-green-500" data-test="icon-cpf-valid" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" data-test="icon-cpf-invalid" />
                            )}
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
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem data-test="campo-data-nascimento-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Data de nascimento * (18+ anos)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          type="date"
                          disabled={isLoading}
                          data-test="input-data-nascimento"
                          className="pl-10"
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email e Celular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem data-test="campo-email-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">E-mail *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input {...field} type="email" placeholder="joao.silva@email.com" disabled={isLoading} data-test="input-email" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="celular"
                render={({ field }) => (
                  <FormItem data-test="campo-celular-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Celular *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          type="tel"
                          placeholder="(69) 98125-2365"
                          disabled={isLoading}
                          data-test="input-celular"
                          className="pl-10"
                          maxLength={15}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Endereço</h3>

            {/* CEP e Logradouro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.cep"
                render={({ field }) => (
                  <FormItem data-test="campo-cep-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      CEP * <span className="text-xs text-gray-500">(Vilhena-RO)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="76980-000"
                          disabled={isLoading}
                          data-test="input-cep"
                          className="pl-10"
                          maxLength={9}
                          onChange={(e) => {
                            const formatted = formatarCep(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco.logradouro"
                render={({ field }) => (
                  <FormItem data-test="campo-logradouro-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Rua *</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Av. Presidente Nasser" disabled={isLoading} data-test="input-logradouro" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bairro e Número */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.bairro"
                render={({ field }) => (
                  <FormItem data-test="campo-bairro-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Bairro *</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Jardim das Oliveiras" disabled={isLoading} data-test="input-bairro" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco.numero"
                render={({ field }) => (
                  <FormItem data-test="campo-numero-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Número *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1240"
                        disabled={isLoading}
                        data-test="input-numero"
                        value={field.value}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === '' ? 1 : parseInt(val, 10));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Complemento */}
            <FormField
              control={form.control}
              name="endereco.complemento"
              render={({ field }) => (
                <FormItem data-test="campo-complemento-wrapper">
                  <FormLabel className="text-sm font-medium text-gray-700">Complemento (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Apartamento 101, Bloco B" disabled={isLoading} data-test="input-complemento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cidade e Estado (readonly) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.cidade"
                render={({ field }) => (
                  <FormItem data-test="campo-cidade-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Cidade *</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" value="Vilhena" readOnly disabled className="bg-gray-100" data-test="input-cidade" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco.estado"
                render={({ field }) => (
                  <FormItem data-test="campo-estado-wrapper">
                    <FormLabel className="text-sm font-medium text-gray-700">Estado *</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" value="RO" readOnly disabled className="bg-gray-100" data-test="input-estado" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Senha de Acesso</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna Esquerda: Campos de Senha */}
              <div className="space-y-4">
                {/* Senha */}
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem data-test="campo-senha-wrapper">
                      <FormLabel className="text-sm font-medium text-gray-700">Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********"
                            disabled={isLoading}
                            data-test="input-senha"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            data-test="button-toggle-senha"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirmar Senha */}
                <FormField
                  control={form.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem data-test="campo-confirmar-senha-wrapper">
                      <FormLabel className="text-sm font-medium text-gray-700">Confirmar senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="********"
                            disabled={isLoading}
                            data-test="input-confirmar-senha"
                            className={`pr-10 ${senhasCoincide === false ? 'border-red-500' : senhasCoincide === true ? 'border-green-500' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            data-test="button-toggle-confirmar-senha"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          {senhasCoincide !== null && confirmarSenhaValue && (
                            <div className="absolute right-12 top-1/2 -translate-y-1/2">
                              {senhasCoincide ? (
                                <Check className="w-5 h-5 text-green-500" data-test="icon-senha-match" />
                              ) : (
                                <X className="w-5 h-5 text-red-500" data-test="icon-senha-mismatch" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Coluna Direita: Requisitos de Senha */}
              {senhaValue && (
                <div className="space-y-2" data-test="password-requirements">
                  <p className="text-sm font-medium text-gray-700 mb-3">Requisitos da senha:</p>
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(senhaValue);
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm" data-test={`password-req-${index}`}>
                        {isValid ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0" data-test={`password-req-${index}-valid`} />
                        ) : (
                          <X className="w-4 h-4 text-red-500 shrink-0" data-test={`password-req-${index}-invalid`} />
                        )}
                        <span className={isValid ? "text-green-600" : "text-gray-600"}>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Botão de Cadastro */}
          <Button
            type="submit"
            disabled={isLoading}
            data-test="button-cadastrar"
            className="w-full bg-[#337695] hover:bg-[#2c5f7a] text-white font-semibold py-6 rounded-lg transition-all shadow-lg uppercase text-sm tracking-wide disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                CADASTRANDO...
              </>
            ) : (
              'CRIAR CONTA'
            )}
          </Button>
        </form>
      </Form>

    </div>
  );
}
