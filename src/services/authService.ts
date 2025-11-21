// src/services/authService.ts

import { post, patch } from './api';

interface RecoverPasswordResponse {
  message: string;
  data: {
    message: string;
  };
}

interface ResetPasswordResponse {
  message: string;
  data: {
    message: string;
  };
}

interface SignupRequest {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  celular: string;
  data_nascimento: string;
  nome_social?: string;
  endereco: {
    logradouro: string;
    cep: string;
    bairro: string;
    numero: number;
    complemento?: string;
    cidade: string;
    estado: string;
  };
}

interface SignupResponse {
  message?: string;
  data?: {
    _id: string;
    nome: string;
    email: string;
    cpf: string;
    celular: string;
    nivel_acesso: {
      municipe: boolean;
      operador: boolean;
      secretario: boolean;
      administrador: boolean;
    };
  };
}

/**
 * Solicita recuperação de senha por email
 */
export async function solicitarRecuperacaoSenha(
  email: string
): Promise<RecoverPasswordResponse> {
  return post<RecoverPasswordResponse>('/recover', { email });
}

/**
 * Redefine senha usando token de recuperação
 */
export async function redefinirSenha(
  token: string,
  senha: string
): Promise<ResetPasswordResponse> {
  return patch<ResetPasswordResponse>(
    `/password/reset?token=${encodeURIComponent(token)}`,
    { senha }
  );
}

/**
 * Cadastra um novo munícipe no sistema
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  return post<SignupResponse>('/signup', data);
}
