import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const TELEFONE_REGEX = /^\d{10,11}$/;

export const createSecretariaSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  
  sigla: z
    .string()
    .min(1, 'Sigla é obrigatória')
    .min(2, 'Sigla deve ter pelo menos 2 caracteres'),
  
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .regex(EMAIL_REGEX, 'Email inválido'),
  
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((val) => {
      const apenasNumeros = val.replace(/\D/g, '');
      return TELEFONE_REGEX.test(apenasNumeros);
    }, 'Telefone inválido. Informe DDD e número válidos EX: (69) 99999-9999'),
  
  tipo: z
    .string()
    .min(1, 'Tipo de Secretaria é obrigatório'),
});

export const updateSecretariaSchema = createSecretariaSchema.partial();

export type CreateSecretariaFormValues = z.infer<typeof createSecretariaSchema>;
export type UpdateSecretariaFormValues = z.infer<typeof updateSecretariaSchema>;

