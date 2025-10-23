// src/types/auth.ts

import type { Endereco } from './endereco';

export interface LoginCredentials {
  identificador: string;
  senha: string;
  lembrarDeMim?: boolean;
}

/**
 * Resposta do login da API
 */
export interface LoginResponse {
  user: {
    accessToken: string;
    refreshtoken: string;
    _id: string;
    nome: string;
    email: string;
    cpf: string;
    celular: string;
    nivel_acesso: {
      municipe?: boolean;
      operador?: boolean;
      secretario?: boolean;
      administrador?: boolean;
    };
    ativo?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown; // Outros campos opcionais do usuário
  };
}

export interface SignupData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  celular: string;
  cnh?: string;
  nome_social?: string;
  endereco: Endereco;
}

export interface RecuperarSenhaRequest {
  email: string;
}

export interface RecuperarSenhaResponse {
  message: string;
}

export interface TokenIntrospection {
  active: boolean;
  client_id?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
}
