// src/lib/validations/auth.ts
import { z } from 'zod';

/**
 * Valida CPF usando o algoritmo de dígitos verificadores
 */
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // CPF deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Valida CNPJ usando o algoritmo de dígitos verificadores
 */
function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // CNPJ deve ter 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(12))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ.charAt(13))) return false;

  return true;
}

/**
 * Valida e-mail com regex padrão
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Detecta e valida o tipo de identificador (CPF, CNPJ ou E-mail)
 */
export function validateIdentificador(value: string): { isValid: boolean; message: string } {
  if (!value || value.trim() === '') {
    return { isValid: false, message: 'Por favor, preencha este campo' };
  }

  const trimmedValue = value.trim();

  // Remove pontos, traços e barras para análise
  const cleanValue = trimmedValue.replace(/[.\-/]/g, '');

  // Se contém @ ou letras, valida como e-mail
  if (trimmedValue.includes('@') || /[a-zA-Z]/.test(trimmedValue)) {
    if (isValidEmail(trimmedValue)) {
      return { isValid: true, message: '' };
    }
    // Mensagem específica para e-mail inválido
    if (!trimmedValue.includes('@')) {
      return { isValid: false, message: 'O e-mail precisa conter o caractere @' };
    }
    if (!trimmedValue.includes('.')) {
      return { isValid: false, message: 'O e-mail precisa conter um domínio válido (ex: @gmail.com)' };
    }
    const parts = trimmedValue.split('@');
    if (parts.length > 2) {
      return { isValid: false, message: 'O e-mail não pode conter mais de um @' };
    }
    if (parts[0].length === 0) {
      return { isValid: false, message: 'Digite o nome do usuário antes do @' };
    }
    if (parts.length === 2 && parts[1].length === 0) {
      return { isValid: false, message: 'Digite o domínio após o @ (ex: gmail.com)' };
    }
    return { isValid: false, message: 'Insira um e-mail válido (ex: seunome@email.com)' };
  }

  // Se tem apenas números (após limpeza)
  if (/^\d+$/.test(cleanValue)) {
    // CPF: 11 dígitos
    if (cleanValue.length === 11) {
      if (/^(\d)\1{10}$/.test(cleanValue)) {
        return { isValid: false, message: 'CPF não pode ter todos os dígitos iguais' };
      }
      if (isValidCPF(cleanValue)) {
        return { isValid: true, message: '' };
      }
      return { isValid: false, message: 'CPF inválido. Verifique os números digitados' };
    }

    // CNPJ: 14 dígitos
    if (cleanValue.length === 14) {
      if (/^(\d)\1{13}$/.test(cleanValue)) {
        return { isValid: false, message: 'CNPJ não pode ter todos os dígitos iguais' };
      }
      if (isValidCNPJ(cleanValue)) {
        return { isValid: true, message: '' };
      }
      return { isValid: false, message: 'CNPJ inválido. Verifique os números digitados' };
    }

    // Número de dígitos incorreto - mensagens específicas
    if (cleanValue.length < 11) {
      return {
        isValid: false,
        message: `Digite ${11 - cleanValue.length} número(s) a mais para completar o CPF`
      };
    }
    if (cleanValue.length > 11 && cleanValue.length < 14) {
      return {
        isValid: false,
        message: `Digite ${14 - cleanValue.length} número(s) a mais para completar o CNPJ`
      };
    }
    if (cleanValue.length > 14) {
      return {
        isValid: false,
        message: `Você digitou ${cleanValue.length - 14} número(s) a mais. CPF tem 11 dígitos e CNPJ tem 14`
      };
    }
  }

  return { isValid: false, message: 'Digite um e-mail, CPF (11 dígitos) ou CNPJ (14 dígitos)' };
}

export const loginSchema = z.object({
  identificador: z
    .string()
    .min(1, 'Por favor, preencha este campo')
    .superRefine((value, ctx) => {
      const validation = validateIdentificador(value);
      if (!validation.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: validation.message,
        });
      }
    }),
  senha: z
    .string()
    .min(1, 'Por favor, digite sua senha')
    .min(1, 'A senha não pode estar vazia'),
  lembrarDeMim: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
