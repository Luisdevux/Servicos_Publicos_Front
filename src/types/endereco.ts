// src/types/endereco.ts

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type EstadoBrasil = typeof ESTADOS_BRASIL[number];

export const TIPOS_LOGRADOURO = [
  'Rua',
  'Avenida',
  'Travessa',
  'Alameda',
  'Via',
  'Rodovia'
] as const;

export type TipoLogradouro = typeof TIPOS_LOGRADOURO[number];

export interface Endereco {
  logradouro: string;
  cep: string;
  bairro: string;
  numero: string;
  complemento?: string;
  cidade?: string;
  estado?: EstadoBrasil;
}
