// src/components/LoginMunicipeForm.tsx

'use client';

import { useState } from 'react';
import { Eye, EyeOff, Users, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import useLogin from '@/hooks/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

export default function LoginMunicipeForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormValues>({
    identificador: '',
    senha: '',
    lembrarDeMim: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});

  const { login, isLoading } = useLogin();

  const validateField = (name: keyof LoginFormValues, value: string) => {
    try {
      loginSchema.shape[name].parse(value);
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      return true;
    } catch (error: unknown) {
      // Extrai a mensagem de erro do Zod
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> };
        const errorMessage = zodError.issues[0]?.message || 'Campo inválido';
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: 'Campo inválido' }));
      }
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa erro ao digitar
    if (errors[name as keyof LoginFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Valida apenas se tiver conteúdo
    if (value.trim()) {
      validateField(name as keyof LoginFormValues, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida todo o formulário
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof LoginFormValues;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);

      // Mostra toast com o primeiro erro
      const firstError = Object.values(fieldErrors)[0];
      if (firstError) {
        toast.error('Erro de validação', {
          description: firstError,
        });
      }
      return;
    }

    await login({
      identificador: formData.identificador,
      senha: formData.senha,
      lembrarDeMim: formData.lembrarDeMim,
      tipoUsuario: 'municipe',
      callbackUrl: '/',
    });
  };

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

      <form onSubmit={handleSubmit} className="space-y-4" data-test="formulario-login" noValidate>
        {/* Campo Identificador */}
        <div className="space-y-2" data-test="campo-identificador-wrapper">
          <Label htmlFor="identificador" className="text-sm font-medium text-gray-700">
            E-mail, CPF ou CNPJ
          </Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="identificador"
              name="identificador"
              type="text"
              value={formData.identificador}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Digite seu e-mail, CPF ou CNPJ"
              disabled={isLoading}
              data-test="input-identificador"
              className={cn(
                'pl-10 focus-visible:ring-[#337695] focus-visible:border-[#337695]',
                errors.identificador && 'border-red-500 focus-visible:ring-red-500'
              )}
              aria-invalid={!!errors.identificador}
              aria-describedby={errors.identificador ? 'identificador-error' : undefined}
            />
          </div>
          <div className="min-h-[20px]">
            {errors.identificador && (
              <p id="identificador-error" className="text-xs text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.identificador}</span>
              </p>
            )}
          </div>
        </div>

        {/* Campo Senha */}
        <div className="space-y-2" data-test="campo-senha-wrapper">
          <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="senha"
              name="senha"
              type={showPassword ? 'text' : 'password'}
              value={formData.senha}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Digite sua senha"
              disabled={isLoading}
              data-test="input-senha"
              className={cn(
                'pl-10 pr-10 focus-visible:ring-[#337695] focus-visible:border-[#337695]',
                errors.senha && 'border-red-500 focus-visible:ring-red-500'
              )}
              aria-invalid={!!errors.senha}
              aria-describedby={errors.senha ? 'senha-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              data-test="button-toggle-senha"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="min-h-[20px]">
            {errors.senha && (
              <p id="senha-error" className="text-xs text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.senha}</span>
              </p>
            )}
          </div>
        </div>

        {/* Checkbox Lembrar de mim e Link Esqueceu a senha */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lembrar-de-mim"
              checked={formData.lembrarDeMim}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, lembrarDeMim: checked as boolean }))
              }
              data-test="checkbox-lembrar-de-mim"
            />
            <label
              htmlFor="lembrar-de-mim"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Lembrar de mim
            </label>
          </div>
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
          colorClass="bg-[#337695] hover:bg-[#2c5f7a]"
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
