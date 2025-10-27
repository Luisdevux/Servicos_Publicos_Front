// src/components/LoginForm.tsx

'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import useLogin from '@/hooks/useLogin';
import type { UserType } from '@/lib/auth';

interface LoginFormProps {
  userType: UserType;
}

export default function LoginForm({ userType }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ 
      identificador: identifier, 
      senha: password,
      callbackUrl: '/' 
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md" data-test="form-login">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-2" data-test="titulo-login">
        Login Funcionário
      </h2>
      <p className="text-gray-600 text-center mb-6 text-sm" data-test="subtitulo-login">
        Acesse com suas credenciais
      </p>

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
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="E-mail, CPF ou Usuário"
              required
              disabled={isLoading}
              data-test="input-identificador"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#337695] focus:border-[#337695] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isLoading}
              data-test="input-senha"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#337695] focus:border-[#337695] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="text-sm text-[#337695] hover:underline transition-colors"
            data-test="link-esqueceu-senha"
          >
            Esqueceu sua senha?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          data-test="button-acessar"
          className="w-full bg-[#337695] hover:bg-[#2c5f7a] text-white font-semibold py-3 rounded-lg transition-all shadow-lg uppercase text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          {isLoading ? 'ENTRANDO...' : 'ACESSAR'}
        </button>
      </form>
    </div>
  );
}
