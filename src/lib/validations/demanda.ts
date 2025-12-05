// src/lib/validations/demanda.ts
import { z } from 'zod';

/**
 * Valida CEP de Vilhena - RO
 * Range válido: 76980-000 a 76999-999
 */
function isValidCepVilhena(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) return false;
  
  const cepNumber = parseInt(cleanCep, 10);
  return cepNumber >= 76980000 && cepNumber <= 76999999;
}

/**
 * Valida se o número do endereço é válido
 */
function isValidNumero(numero: string): boolean {
  const cleanNumero = numero.replace(/\D/g, '');
  if (cleanNumero.length === 0) return false;
  
  const numeroInt = parseInt(cleanNumero, 10);
  return numeroInt > 0 && numeroInt < 99999;
}

export const createDemandaSchema = z.object({
  // Endereço
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .refine((value) => {
      const cleanCep = value.replace(/\D/g, '');
      return cleanCep.length === 8;
    }, 'CEP deve ter 8 dígitos')
    .refine((value) => {
      return isValidCepVilhena(value);
    }, 'CEP deve ser de Vilhena - RO (76980-000 a 76999-999)'),
  
  bairro: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .min(3, 'Bairro deve ter pelo menos 3 caracteres')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  
  tipoLogradouro: z
    .string()
    .min(1, 'Tipo de logradouro é obrigatório'),
  
  logradouro: z
    .string()
    .min(1, 'Logradouro é obrigatório')
    .min(3, 'Logradouro deve ter pelo menos 3 caracteres')
    .max(200, 'Logradouro deve ter no máximo 200 caracteres'),
  
  numero: z
    .string()
    .min(1, 'Número é obrigatório')
    .refine((value) => {
      return isValidNumero(value);
    }, 'Digite um número válido (ex: 123)'),
  
  complemento: z
    .string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional(),
  
  // Descrição
  descricao: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  // Imagens - validação no componente
  imagens: z
    .array(z.instanceof(File))
    .min(1, 'Adicione pelo menos uma imagem da ocorrência')
    .max(3, 'Máximo de 3 imagens permitidas'),
});

export type CreateDemandaFormValues = z.infer<typeof createDemandaSchema>;

/**
 * Helper para formatar CEP
 */
export function formatCep(value: string): string {
  const cleanCep = value.replace(/\D/g, '');
  if (cleanCep.length <= 5) {
    return cleanCep;
  }
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
}

/**
 * Helper para validar tipo de arquivo de imagem
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
  return validTypes.includes(file.type);
}

/**
 * Helper para validar tamanho de arquivo
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
