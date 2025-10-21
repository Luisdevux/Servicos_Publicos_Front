// src/types/tipoDemanda.ts

export interface TipoDemanda {
  _id: string;
  titulo: string;
  descricao: string;
  subdescricao: string;
  link_imagem?: string;
  icone?: string;
  tipo: string;
  usuarios?: string[]; // Array de IDs
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formulários
export interface CreateTipoDemandaData {
  titulo: string;
  descricao: string;
  subdescricao: string;
  icone: string;
  link_imagem: string;
  tipo: string;
}

export interface UpdateTipoDemandaData {
  titulo?: string;
  descricao?: string;
  subdescricao?: string;
  icone?: string;
  link_imagem?: string;
  tipo?: string;
}

export interface TipoDemandaFilters {
  titulo?: string;
  tipo?: string;
}
