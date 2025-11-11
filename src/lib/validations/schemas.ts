/**
 * Schemas de validação usando Zod
 */

import { z } from 'zod';
import { validateCEPVilhena, validateCPF, cleanCPF, cleanCEP, cleanPhoneNumber } from '../profileHelpers';

// ============================================
// Schemas base reutilizáveis
// ============================================

export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .transform((val) => cleanCPF(val))
  .refine(
    (val) => {
      const validation = validateCPF(val);
      return validation.valid;
    },
    { message: 'CPF inválido' }
  );

export const cepVilhenaSchema = z
  .string()
  .min(1, 'CEP é obrigatório')
  .transform((val) => cleanCEP(val))
  .refine(
    (val) => {
      const validation = validateCEPVilhena(val);
      return validation.valid;
    },
    { message: 'CEP deve ser de Vilhena-RO (76980-001 a 76989-999)' }
  );

export const celularSchema = z
  .string()
  .min(1, 'Celular é obrigatório')
  .transform((val) => cleanPhoneNumber(val))
  .refine(
    (val) => val.length >= 10 && val.length <= 11,
    'Celular deve ter 10 ou 11 dígitos'
  );

export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido');

export const nomeCompletoSchema = z
  .string()
  .min(1, 'Nome completo é obrigatório')
  .min(3, 'Nome deve ter pelo menos 3 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras');

export const senhaSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres');

// ============================================
// Schema de Endereço
// ============================================

export const enderecoSchema = z.object({
  cep: cepVilhenaSchema,
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.union([
    z.string().min(1, 'Número é obrigatório'),
    z.number().min(1, 'Número é obrigatório'),
  ]),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório').max(2, 'Use a sigla do estado'),
});

// ============================================
// Schema de Cadastro de Munícipe
// ============================================

export const cadastroMunicipeSchema = z
  .object({
    nome: nomeCompletoSchema,
    email: emailSchema,
    cpf: cpfSchema,
    data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
    celular: celularSchema,
    senha: senhaSchema,
    confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
    endereco: enderecoSchema,
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

// ============================================
// Schema de Cadastro de Funcionário
// ============================================

export const cadastroFuncionarioSchema = z
  .object({
    nome: nomeCompletoSchema,
    email: emailSchema,
    cpf: cpfSchema,
    data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
    celular: celularSchema,
    cargo: z.string().min(1, 'Cargo é obrigatório'),
    formacao: z.string().optional(),
    senha: senhaSchema,
    confirmarSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
    secretaria_id: z.string().optional(),
    nivel_acesso: z.object({
      administrador: z.boolean().optional(),
      secretario: z.boolean().optional(),
      operador: z.boolean().optional(),
    }),
    endereco: enderecoSchema,
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

// ============================================
// Schema de Atualização de Perfil
// ============================================

export const updatePerfilSchema = z.object({
  nome: nomeCompletoSchema,
  celular: celularSchema,
  cargo: z.string().optional(),
  formacao: z.string().optional(),
  endereco: z.object({
    cep: cepVilhenaSchema,
    logradouro: z.string().min(1, 'Logradouro é obrigatório'),
    numero: z.union([
      z.string().min(1, 'Número é obrigatório'),
      z.number().min(1, 'Número é obrigatório'),
    ]),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().optional(), // Preenchido automaticamente pelo CEP
    estado: z.string().optional(), // Preenchido automaticamente pelo CEP
  }),
});

export type CadastroMunicipeInput = z.infer<typeof cadastroMunicipeSchema>;
export type CadastroFuncionarioInput = z.infer<typeof cadastroFuncionarioSchema>;
export type UpdatePerfilInput = z.infer<typeof updatePerfilSchema>;