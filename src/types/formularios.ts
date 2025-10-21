// src/types/form.ts

import type { TipoLogradouro } from './endereco';
import type { TipoDemanda, TipoPedido } from './demanda';

/**
 * Formulário de cadastro de usuário (munícipe)
 */
export interface CadastroFormData {
  nomeCivil: string;
  nomeSocial: string;
  email: string;
  dataNascimento: string;
  cpf: string;
  celular: string;
  cep: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
  confirmarEmail: string;
  senha: string;
  confirmarSenha: string;
}

/**
 * Formulário de criação de demanda
 */
export interface CreateDemandaFormData {
  tipo: TipoDemanda | string;
  tipoPedido?: TipoPedido;
  descricao: string;
  tipoLogradouro?: TipoLogradouro;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  imagem?: File;
}

/**
 * Formulário de login
 */
export interface LoginFormData {
  email: string;
  senha: string;
}

/**
 * Formulário de recuperação de senha
 */
export interface RecuperarSenhaFormData {
  email: string;
}
