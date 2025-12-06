import { z } from 'zod';

export const createTipoDemandaSchema = z.object({
  titulo: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres'),
  
  descricao: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  
  subdescricao: z.string().optional(),
  
  icone: z.string().optional(),
  
  link_imagem: z.string().optional(),
  
  tipo: z
    .string()
    .min(1, 'Tipo é obrigatório'),
});

export const updateTipoDemandaSchema = createTipoDemandaSchema.partial();

export type CreateTipoDemandaFormValues = z.infer<typeof createTipoDemandaSchema>;
export type UpdateTipoDemandaFormValues = z.infer<typeof updateTipoDemandaSchema>;

