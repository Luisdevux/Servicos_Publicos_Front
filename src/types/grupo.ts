// src/types/grupo.ts

export interface Permissao {
  rota: string;
  dominio?: string;
  ativo?: boolean;
  buscar?: boolean;
  enviar?: boolean;
  substituir?: boolean;
  modificar?: boolean;
  excluir?: boolean;
}

export interface Grupo {
  _id: string;
  nome: string;
  descricao: string;
  ativo?: boolean;
  permissoes: Permissao[];
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formulários
export interface CreateGrupoData {
  nome: string;
  descricao: string;
  ativo?: boolean;
  permissoes: Permissao[];
}

export interface UpdateGrupoData {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
  permissoes?: Permissao[];
}
