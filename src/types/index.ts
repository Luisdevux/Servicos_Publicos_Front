// src/types/index.ts

/**
 * Exporta todos os types do projeto
 */

// API
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  PaginationParams,
  SearchParams
} from './api';

// Auth
export type {
  LoginCredentials,
  LoginResponse,
  SignupData,
  RecuperarSenhaRequest,
  RecuperarSenhaResponse,
  TokenIntrospection
} from './auth';

// Demanda
export type {
  Demanda,
  TipoDemanda,
  StatusDemanda,
  TipoPedido,
  Pedido,
  CreateDemandaData,
  UpdateDemandaData,
  AtribuirDemandaData,
  DevolverDemandaData,
  ResolverDemandaData
} from './demanda';

export {
  TIPOS_DEMANDA,
  STATUS_DEMANDA,
  TIPOS_PEDIDO
} from './demanda';

// Tipo Demanda
export type {
  TipoDemanda as TipoDemandaModel,
  CreateTipoDemandaData,
  UpdateTipoDemandaData,
  TipoDemandaFilters
} from './tipoDemanda';

// Endereço
export type {
  Endereco,
  EstadoBrasil,
  TipoLogradouro
} from './endereco';

export {
  ESTADOS_BRASIL,
  TIPOS_LOGRADOURO
} from './endereco';

// User
export type {
  Usuarios,
  NivelAcesso,
  UserType,
  CreateUsuariosData,
  UpdateUsuariosData,
  UsuariosFilters
} from './usuarios';

// Secretaria
export type {
  Secretaria,
  CreateSecretariaData,
  UpdateSecretariaData
} from './secretaria';

// Grupo
export type {
  Grupo,
  Permissao,
  CreateGrupoData,
  UpdateGrupoData
} from './grupo';

// Form
export type {
  CadastroFormData,
  CreateDemandaFormData,
  LoginFormData,
  RecuperarSenhaFormData
} from './formularios';
