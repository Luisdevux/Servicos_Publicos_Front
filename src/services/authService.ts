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
