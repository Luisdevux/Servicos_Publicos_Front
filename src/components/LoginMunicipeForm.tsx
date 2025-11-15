// src/components/LoginMunicipeForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import useLogin from '@/hooks/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';

export default function LoginMunicipeForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identificador: '',
      senha: '',
      lembrarDeMim: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login({
      identificador: data.identificador,
      senha: data.senha,
      lembrarDeMim: data.lembrarDeMim,
      tipoUsuario: 'municipe',
      callbackUrl: '/',
    });
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.submitCount]); 

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md" data-test="form-login-municipe">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2" data-test="titulo-login">
          Acesso Munícipe
        </h2>
        <p className="text-gray-600 text-sm" data-test="subtitulo-login">
          Entre com suas credenciais
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-test="formulario-login" noValidate>
          {/* Campo Identificador */}
          <FormField
            control={form.control}
            name="identificador"
            render={({ field }) => (
              <FormItem data-test="campo-identificador-wrapper">
                <FormLabel className="text-sm font-medium text-gray-700">
                  E-mail, CPF ou CNPJ
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...field}
                      type="text"
                      placeholder="Digite seu e-mail, CPF ou CNPJ"
                      disabled={isLoading}
                      data-test="input-identificador"
                      className="pl-10 focus-visible:ring-[#337695] focus-visible:border-[#337695]"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Senha */}
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem data-test="campo-senha-wrapper">
                <FormLabel className="text-sm font-medium text-gray-700">
                  Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      disabled={isLoading}
                      data-test="input-senha"
                      className="pl-10 pr-10 focus-visible:ring-[#337695] focus-visible:border-[#337695]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      data-test="button-toggle-senha"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
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

          {/* Checkbox Lembrar de mim e Link Esqueceu a senha */}
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="lembrarDeMim"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lembrar-de-mim"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-test="checkbox-lembrar-de-mim"
                  />
                  <label
                    htmlFor="lembrar-de-mim"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Lembrar de mim
                  </label>
                </div>
              )}
            />
            <Link
              href="/recuperar-senha"
              className="text-sm text-[#337695] hover:underline transition-colors"
              data-test="link-esqueceu-senha"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Botão de Login */}
          <Button
            type="submit"
            disabled={isLoading}
            data-test="button-acessar"
            className="w-full bg-[#337695] hover:bg-[#2c5f7a] text-white font-semibold py-6 rounded-lg transition-all shadow-lg uppercase text-sm tracking-wide disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                ENTRANDO...
              </>
            ) : (
              'ACESSAR'
            )}
          </Button>
        </form>
      </Form>

      {/* Link de Cadastro */}
      <div className="mt-6 text-center text-sm text-gray-600" data-test="link-cadastro-wrapper">
        Não possui cadastro?{' '}
        <Link
          href="/cadastro"
          className="text-[#337695] font-medium hover:underline transition-colors"
          data-test="link-cadastro"
        >
          Cadastre-se aqui
        </Link>
      </div>
    </div>
  );
}
