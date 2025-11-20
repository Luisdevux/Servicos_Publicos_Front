// src/components/EsqueceuSenhaForm.tsx

'use client';

import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { esqueceuSenhaSchema, type EsqueceuSenhaFormValues } from '@/lib/validations/auth';
import { solicitarRecuperacaoSenha } from '@/services/authService';

export default function EsqueceuSenhaForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const form = useForm<EsqueceuSenhaFormValues>({
    resolver: zodResolver(esqueceuSenhaSchema),
    defaultValues: {
      email: '',
    },
  });

  // Toast quando houver erros de validação no submit
  const onInvalid = () => {
    const errors = form.formState.errors;
    
    if (errors.email?.message) {
      toast.error('E-mail inválido', {
        description: errors.email.message,
      });
    } else {
      toast.error('Erro de validação', {
        description: 'Por favor, preencha o campo de e-mail corretamente.',
      });
    }
  };

  const onSubmit = async (data: EsqueceuSenhaFormValues) => {
    setIsLoading(true);
    try {
      await solicitarRecuperacaoSenha(data.email);
      
      setEmailEnviado(true);
      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada e spam.',
      });
    } catch {
      // Por segurança, sempre mostra mensagem genérica
      setEmailEnviado(true);
      toast.success('E-mail enviado!', {
        description: 'Se o e-mail estiver cadastrado, você receberá instruções.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md" data-test="form-esqueceu-senha">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2" data-test="titulo-esqueceu-senha">
          Esqueceu sua senha?
        </h2>
        <p className="text-gray-600 text-sm" data-test="subtitulo-esqueceu-senha">
          Digite seu e-mail para receber instruções
        </p>
      </div>

      {emailEnviado ? (
        <Alert className="mb-6 border-green-200 bg-green-50" data-test="alerta-email-enviado">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>E-mail enviado com sucesso!</strong>
            <br />
            Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4" data-test="formulario-esqueceu-senha" noValidate>
            {/* Campo E-mail */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem data-test="campo-email-wrapper">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    E-mail
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        className="pl-10 h-12 border-gray-300 focus:border-[#337695] focus:ring-[#337695]"
                        disabled={isLoading}
                        data-test="input-email"
                        autoComplete="email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage data-test="erro-email" />
                </FormItem>
              )}
            />

            {/* Botão Enviar */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold text-white"
              style={{ backgroundColor: 'var(--global-accent)' }}
              disabled={isLoading}
              data-test="botao-enviar-email"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Enviando...
                </span>
              ) : (
                'Enviar link de recuperação'
              )}
            </Button>
          </form>
        </Form>
      )}

      {emailEnviado && (
        <Button
          className="w-full mt-4 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setEmailEnviado(false);
            form.reset();
          }}
          data-test="botao-enviar-novamente"
        >
          Enviar novamente
        </Button>
      )}
    </div>
  );
}
