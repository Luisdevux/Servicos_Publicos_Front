// src/components/NovaSenhaForm.tsx

'use client';

import { useState, useMemo } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { novaSenhaSchema, type NovaSenhaFormValues } from '@/lib/validations/auth';
import { redefinirSenha } from '@/services/authService';

interface NovaSenhaFormProps {
  token: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'Mínimo 8 caracteres',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'Pelo menos uma letra minúscula',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'Pelo menos um número',
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: 'Pelo menos um caractere especial (@, $, !, %, *, ?, &)',
    test: (password: string) => /[@$!%*?&]/.test(password),
  },
];

export default function NovaSenhaForm({ token }: NovaSenhaFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<NovaSenhaFormValues>({
    resolver: zodResolver(novaSenhaSchema),
    defaultValues: {
      senha: '',
      confirmarSenha: '',
    },
  });

  const senhaAtual = form.watch('senha');

  const requisitosStatus = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      fulfilled: req.test(senhaAtual || ''),
    }));
  }, [senhaAtual]);

  // Toast quando houver erros de validação no submit
  const onInvalid = () => {
    const errors = form.formState.errors;
    
    if (errors.senha?.message) {
      toast.error('Senha inválida', {
        description: errors.senha.message,
      });
    } else if (errors.confirmarSenha?.message) {
      toast.error('Confirmação de senha inválida', {
        description: errors.confirmarSenha.message,
      });
    } else {
      toast.error('Erro de validação', {
        description: 'Por favor, preencha todos os campos corretamente.',
      });
    }
  };

  const onSubmit = async (data: NovaSenhaFormValues) => {
    setIsLoading(true);
    setErro(null);
    
    try {
      await redefinirSenha(token, data.senha);
      
      setSenhaAlterada(true);
      toast.success('Senha alterada com sucesso!', {
        description: 'Você será redirecionado para o login.',
      });

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        router.push('/login/municipe');
      }, 3000);
    } catch (error: unknown) {
      let errorMessage = 'Erro ao redefinir senha. Tente novamente.';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Mensagens específicas baseadas no erro
      if (errorMessage.includes('expirado')) {
        setErro('Link de recuperação expirado. Solicite um novo link.');
      } else if (errorMessage.includes('inválido') || errorMessage.includes('não encontrado')) {
        setErro('Link de recuperação inválido ou já utilizado. Solicite um novo link.');
      } else if (errorMessage.includes('utilizado')) {
        setErro('Este link já foi utilizado. Solicite um novo link de recuperação.');
      } else {
        setErro(errorMessage);
      }
      
      toast.error('Erro ao redefinir senha', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md" data-test="form-nova-senha">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2" data-test="titulo-nova-senha">
          Criar Nova Senha
        </h2>
        <p className="text-gray-600 text-sm" data-test="subtitulo-nova-senha">
          Sua senha deve ter no mínimo 8 caracteres
        </p>
      </div>

      {erro && (
        <Alert className="mb-6 border-red-200 bg-red-50" data-test="alerta-erro">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Erro:</strong> {erro}
            <br />
            <Link 
              href="/esqueci-senha" 
              className="text-red-700 underline hover:text-red-900 font-semibold mt-2 inline-block"
            >
              Solicitar novo link de recuperação
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {senhaAlterada ? (
        <Alert className="mb-6 border-green-200 bg-green-50" data-test="alerta-sucesso">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Senha alterada com sucesso!</strong>
            <br />
            Redirecionando para o login...
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4" data-test="formulario-nova-senha" noValidate>
            {/* Campo Nova Senha */}
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem data-test="campo-senha-wrapper">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Nova Senha
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua nova senha"
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#337695] focus:ring-[#337695]"
                        disabled={isLoading}
                        data-test="input-senha"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        data-test="toggle-senha"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage data-test="erro-senha" />
                </FormItem>
              )}
            />

            {/* Campo Confirmar Senha */}
            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem data-test="campo-confirmar-senha-wrapper">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Digite novamente sua senha"
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-[#337695] focus:ring-[#337695]"
                        disabled={isLoading}
                        data-test="input-confirmar-senha"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        data-test="toggle-confirmar-senha"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage data-test="erro-confirmar-senha" />
                </FormItem>
              )}
            />

            {/* Requisitos da Senha */}
            <div className="text-xs space-y-2 bg-gray-50 p-4 rounded-lg" data-test="requisitos-senha">
              <p className="font-semibold text-gray-700 mb-2">A senha deve conter:</p>
              <ul className="space-y-1.5">
                {requisitosStatus.map((req, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 transition-colors ${
                      req.fulfilled ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {req.fulfilled ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botão Salvar */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold text-white"
              style={{ backgroundColor: 'var(--global-accent)' }}
              disabled={isLoading}
              data-test="botao-salvar-senha"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Salvando...
                </span>
              ) : (
                'Salvar nova senha'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
