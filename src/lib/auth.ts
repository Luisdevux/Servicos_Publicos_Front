// src/lib/auth.ts

export type UserType = 'administrador' | 'operador' | 'secretaria' | 'municipe';

export interface LoginCredentials {
  identificador: string;
  senha: string;
}

export interface LoginResponse {
  user: {
    accessToken: string;
    refreshtoken: string;
    _id: string;
    nome: string;
    email: string;
    cpf?: string;
    cnpj?: string;
    nivel_acesso: {
      municipe: boolean;
      operador: boolean;
      secretario: boolean;
      administrador: boolean;
    };
  };
}

export function getUserTypeFromLevel(nivel_acesso: LoginResponse['user']['nivel_acesso']): UserType {
  if (nivel_acesso.administrador) return 'administrador';
  if (nivel_acesso.secretario) return 'secretaria';
  if (nivel_acesso.operador) return 'operador';
  if (nivel_acesso.municipe) return 'municipe';
  return 'municipe'; // fallback
}
