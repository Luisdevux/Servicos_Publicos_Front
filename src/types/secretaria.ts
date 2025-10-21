// src/types/secretaria.ts

export interface Secretaria {
  _id: string;
  nome: string;
  sigla: string;
  email: string;
  telefone: string;
  tipo: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formulários
export interface CreateSecretariaData {
  nome: string;
  sigla: string;
  email: string;
  telefone: string;
  tipo: string;
}

export interface UpdateSecretariaData {
  nome?: string;
  sigla?: string;
  email?: string;
  telefone?: string;
  tipo?: string;
}
