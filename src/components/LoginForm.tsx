// src/components/LoginForm.tsx

'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useLogin } from '@/hooks/useAuthMutations';
import { useQueryState } from 'nuqs';
import type { UserType } from '@/lib/auth';

interface LoginFormProps {
  userType: UserType;
}

export default function LoginForm({ userType }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useQueryState('email', { defaultValue: '' });
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useQueryState('loginType', {
    defaultValue: 'email' as 'email' | 'cpf' | 'usuario',
  });

  const loginMutation = useLogin(userType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate({
      email: loginType === 'email' ? email : loginType === 'cpf' ? cpf : email,
      senha: password,
    });
  };

  const getUserTypeLabel = () => {
    if (userType === 'administrador') return 'Administrador';
    if (userType === 'operador') return 'Operador';
    return 'Secretaria';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md" data-test="form-login">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-2" data-test="titulo-login">
        Login
      </h2>
      <p className="text-gray-600 text-center mb-6 text-sm" data-test="subtitulo-login">
        Acesse como {getUserTypeLabel()}
      </p>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1" data-test="tabs-tipo-login">
        <button
          type="button"
          onClick={() => setLoginType('email')}
          className={'flex-1 py-2.5 text-sm font-medium rounded-md transition-all ' + (loginType === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
          data-test="tab-email"
        >
          E-mail
        </button>
        <button
          type="button"
          onClick={() => setLoginType('cpf')}
          className={'flex-1 py-2.5 text-sm font-medium rounded-md transition-all ' + (loginType === 'cpf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
          data-test="tab-cpf"
        >
          CPF
        </button>
        <button
          type="button"
          onClick={() => setLoginType('usuario')}
          className={'flex-1 py-2.5 text-sm font-medium rounded-md transition-all ' + (loginType === 'usuario' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
          data-test="tab-usuario"
        >
          Usuário
        </button>
      </div>

      {loginMutation.isError && (
        <div 
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          data-test="mensagem-erro"
          role="alert"
        >
          {loginMutation.error?.message || 'Erro ao fazer login. Verifique suas credenciais.'}
        </div>
      )}

      <div 
        className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs"
        data-test="dica-senha"
      >
        <strong>Dica:</strong> A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-test="formulario-login">
        <div data-test="campo-identificador-wrapper">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loginType === 'email' ? (
                <Mail className="h-5 w-5 text-gray-400" />
              ) : loginType === 'cpf' ? (
                <UserIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <UserIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <input
              type={loginType === 'email' ? 'email' : 'text'}
              value={loginType === 'cpf' ? cpf : email}
              onChange={(e) => {
                if (loginType === 'cpf') {
                  setCpf(e.target.value);
                } else {
                  setEmail(e.target.value);
                }
              }}
              placeholder={
                loginType === 'email'
                  ? 'E-mail / CPF'
                  : loginType === 'cpf'
                  ? 'CPF'
                  : 'Usuário'
              }
              required
              disabled={loginMutation.isPending}
              data-test="input-identificador"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--global-accent)] focus:border-[var(--global-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div data-test="campo-senha-wrapper">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              disabled={loginMutation.isPending}
              data-test="input-senha"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--global-accent)] focus:border-[var(--global-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              data-test="button-toggle-senha"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <a
            href="#"
            className="text-sm text-[var(--global-accent)] hover:text-[var(--global-accent-hover)] hover:underline transition-colors"
            data-test="link-esqueceu-senha"
          >
            Esqueceu sua senha?
          </a>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          data-test="button-acessar"
          className="w-full bg-[var(--global-accent)] hover:bg-[var(--global-accent-hover)] text-white font-semibold py-3 rounded-lg transition-all shadow-lg uppercase text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          {loginMutation.isPending ? 'ENTRANDO...' : 'ACESSAR'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600" data-test="link-cadastro-wrapper">
        Não possui cadastro?{' '}
        <a 
          href="#" 
          className="font-medium text-[var(--global-accent)] hover:text-[var(--global-accent-hover)] hover:underline transition-colors"
          data-test="link-cadastro"
        >
          Clique aqui
        </a>
      </div>
    </div>
  );
}
