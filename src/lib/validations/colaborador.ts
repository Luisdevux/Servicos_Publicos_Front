// src/lib/validations/colaborador.ts

import { z } from 'zod';

const CPF_REGEX = /^\d{11}$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const CELULAR_REGEX = /^\d{11}$/;
const CNH_REGEX = /^\d{11}$/;

/**
 * Schema de validação para criação de colaborador
 */
export const createColaboradorSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(CPF_REGEX, 'CPF deve conter 11 dígitos'),
  
  celular: z
    .string()
    .min(1, 'Celular é obrigatório')
    .regex(CELULAR_REGEX, 'Celular deve conter 11 dígitos no formato (69)999999999'),
  
  cnh: z
    .string()
    .optional()
    .refine((val) => !val || CNH_REGEX.test(val), {
      message: 'CNH deve conter 11 dígitos'
    }),
  
  data_nascimento: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((data) => {
      const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(data);
      const isBRFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(data);
      return isISOFormat || isBRFormat;
    }, 'Formato de data inválido')
    .refine((data) => {
      try {
        let dataNasc: Date;
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
          const [ano, mes, dia] = data.split('-').map(Number);
          dataNasc = new Date(ano, mes - 1, dia);
        } else {
          const [dia, mes, ano] = data.split('/').map(Number);
          dataNasc = new Date(ano, mes - 1, dia);
        }
        
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        const m = hoje.getMonth() - dataNasc.getMonth();
        
        if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
          idade--;
        }
        
        return idade >= 18;
      } catch {
        return false;
      }
    }, 'Colaborador deve ter 18 anos ou mais'),
  
  cargo: z.string().optional(),
  
  portaria_nomeacao: z.string().optional(),
  
  formacao: z.string().optional(),
  
  nivel_acesso: z.enum(['operador', 'secretario', 'administrador']).refine((val) => !!val, {
    message: 'Selecione o nível de acesso',
  }),
  
  ativo: z.boolean(),
  
  endereco: z.object({
    cep: z
      .string()
      .min(1, 'CEP é obrigatório')
      .regex(CEP_REGEX, 'CEP inválido'),
    logradouro: z.string().min(1, 'Logradouro é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  }),
  
  secretarias: z.array(z.string()).optional(),
});

/**
 * Schema de validação para atualização de colaborador
 */
export const updateColaboradorSchema = createColaboradorSchema.partial().extend({
  endereco: z.object({
    cep: z.string().regex(CEP_REGEX, 'CEP inválido').optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
  }).optional(),
});

export type CreateColaboradorFormValues = z.infer<typeof createColaboradorSchema>;
export type UpdateColaboradorFormValues = z.infer<typeof updateColaboradorSchema>;
