// src/services/authService.ts

import { post } from './api';
import type { LoginCredentials, LoginResponse } from '@/types';

/**
 * Service para autenticação
 * Rotas da API: /login, /logout, /signup, /refresh, /recover
 */
export const authService = {
  /**
   * Faz login do usuário
   * POST /login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // A API retorna: { data: { user: { accessToken, refreshtoken, ...userData } } }
    const response = await post<{ data: LoginResponse }>(
      '/login',
      credentials
    );
    return response.data;
  },

  /**
   * Faz logout do usuário
   * POST /logout
   */
  async logout(token: string): Promise<void> {
    await post('/logout', { access_token: token }, token);
  },

  /**
   * Registra novo usuário
   * POST /signup
   */
  async signup(userData: {
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    celular: string;
    dataNascimento?: string;
    endereco?: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
    };
  }): Promise<LoginResponse> {
    const response = await post<{ data: LoginResponse }>('/signup', userData);
    return response.data;
  },

  /**
   * Valida o token do usuário (introspect)
   * POST /introspect
   */
  async introspect(token: string): Promise<{ valid: boolean; user?: any }> {
    return post('/introspect', { token }, token);
  },

  /**
   * Refresh do token
   * POST /refresh
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await post<{ data: LoginResponse }>(
      '/refresh',
      { refresh_token: refreshToken }
    );
    return response.data;
  },

  /**
   * Envia email para recuperação de senha
   * POST /recover
   */
  async recuperarSenha(email: string): Promise<{ message: string }> {
    return post('/recover', { email });
  },

  /**
   * Revoga o token
   * POST /revoke
   */
  async revoke(token: string): Promise<void> {
    await post('/revoke', {}, token);
  },
};
