// src/types/demanda.ts

import type { Endereco } from './endereco';

export const TIPOS_DEMANDA = [
  'Coleta',
  'Iluminação',
  'Saneamento',
  'Árvores',
  'Animais',
  'Pavimentação'
] as const;

export type TipoDemanda = typeof TIPOS_DEMANDA[number];

export const STATUS_DEMANDA = [
  'Em aberto',
  'Em andamento',
  'Concluída',
  'Recusada'
] as const;

export type StatusDemanda = typeof STATUS_DEMANDA[number];

export const TIPOS_PEDIDO = [
  'Sugestão',
  'Reclamação',
  'Solicitação',
  'Elogio'
] as const;

export type TipoPedido = typeof TIPOS_PEDIDO[number];

export interface Demanda {
  _id: string;
  tipo: TipoDemanda;
  status: StatusDemanda;
  data?: Date;
  resolucao?: string;
  feedback?: number;
  avaliacao_resolucao?: string;
  link_imagem?: string;
  descricao: string;
  motivo_devolucao?: string;
  link_imagem_resolucao?: string;
  endereco: Endereco;
  usuarios?: string[];
  secretarias?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formulários
export interface CreateDemandaData {
  tipo: TipoDemanda;
  descricao: string;
  endereco: Endereco;
  link_imagem?: string;
}

export interface UpdateDemandaData {
  feedback?: number;
  avaliacao_resolucao?: string;
}

export interface AtribuirDemandaData {
  usuarios: string[];
}

export interface DevolverDemandaData {
  motivo_devolucao: string;
}

export interface ResolverDemandaData {
  resolucao: string;
  link_imagem_resolucao?: string;
}

/**
 * Tipo para exibição de pedidos (interface do usuário)
 */
export interface Pedido {
  id: string;
  titulo: string;
  status: StatusDemanda;
  descricao?: string;
  imagem?: string | string[];
  endereco?: {
    cep: string;
    bairro: string;
    tipoLogradouro?: string;
    logradouro: string;
    numero: string;
    complemento: string;
  };
  progresso?: {
    aprovado: boolean;
    emProgresso: boolean;
    concluido: boolean;
  };
  conclusao?: {
    descricao: string;
    imagem?: string | string[];
    dataConclusao: string;
  };
  avaliacao?: {
    feedback: number;
    avaliacao_resolucao: string;
  };
}
