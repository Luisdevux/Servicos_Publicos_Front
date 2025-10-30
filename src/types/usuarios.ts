// src/types/user.ts

import type { Endereco } from './endereco';

export interface Usuarios {
  _id?: string;
  cpf: string;
  email: string;
  celular: string;
  cnh?: string;
  data_nomeacao?: Date;
  cargo?: string;
  formacao?: string;
  link_imagem?: string;
  nivel_acesso: NivelAcesso;
  nome: string;
  ativo?: boolean;
  nome_social?: string;
  portaria_nomeacao?: string;
  endereco?: Endereco;
  tokenUnico?: string;
  refreshtoken?: string;
  accesstoken?: string;
  codigo_recupera_senha?: string;
  exp_codigo_recupera_senha?: Date;
  grupo?: string;
  secretarias?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NivelAcesso {
  municipe?: boolean;
  operador?: boolean;
  secretario?: boolean;
  administrador?: boolean;
}

export type UserType = 'municipe' | 'operador' | 'secretaria' | 'administrador';

// Tipos para formulários
export interface CreateUsuariosData {
  cpf: string;
  email: string;
  celular: string;
  cnh?: string;
  data_nomeacao?: string;
  cargo?: string;
  formacao?: string;
  link_imagem?: string;
  nivel_acesso: NivelAcesso;
  nome: string;
  ativo?: boolean;
  nome_social?: string;
  portaria_nomeacao?: string;
  senha?: string;
  endereco: Endereco;
  secretarias?: string[];
}

export interface UpdateUsuariosData {
  celular?: string;
  cargo?: string;
  formacao?: string;
  nome?: string;
  nome_social?: string;
  endereco?: Endereco;
  link_imagem?: string;
  ativo?: boolean;
}

export interface UsuariosFilters {
  nome?: string;
  email?: string;
  ativo?: boolean;
  secretaria?: string;
  cargo?: string;
  formacao?: string;
}
