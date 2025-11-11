// src/types/next-auth.d.ts

import "next-auth";
import type { Endereco } from "./endereco";

declare module "next-auth" {

  interface Session {
    user: {
      id: string;
      nome: string;
      email: string;
      cpf?: string;
      cnpj?: string;
      data_nascimento?: string;
      username?: string;
      celular: string;
      nivel_acesso: {
        municipe?: boolean;
        operador?: boolean;
        secretario?: boolean;
        administrador?: boolean;
      };
      ativo: boolean;
      link_imagem?: string;
      nome_social?: string;
      cargo?: string;
      formacao?: string;
      endereco?: Endereco;
    };
    error?: string;
  }

  interface User {
    id: string;
    nome: string;
    email: string;
    cpf?: string;
    cnpj?: string;
    username?: string;
    celular: string;
    nivel_acesso: {
      municipe?: boolean;
      operador?: boolean;
      secretario?: boolean;
      administrador?: boolean;
    };
    ativo: boolean;
    accesstoken: string;
    refreshtoken: string;
    lembrarDeMim?: boolean;
    link_imagem?: string;
    nome_social?: string;
    cargo?: string;
    formacao?: string;
    endereco?: Endereco;
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nome: string;
    email: string;
    cpf?: string;
    cnpj?: string;
    username?: string;
    celular: string;
    nivel_acesso: {
      municipe?: boolean;
      operador?: boolean;
      secretario?: boolean;
      administrador?: boolean;
    };
    ativo: boolean;
    accesstoken: string;
    refreshtoken: string;
    lembrarDeMim?: boolean;
    accessTokenExpires?: number;
    error?: string;
    errorDetails?: string;
    link_imagem?: string;
    nome_social?: string;
    cargo?: string;
    formacao?: string;
    endereco?: Endereco;
  }
}

