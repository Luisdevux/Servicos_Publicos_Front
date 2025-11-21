// src/lib/validations/signup.ts

import { z } from "zod";
import { validateCPF, validateCEPVilhena, cleanCPF, cleanCEP, cleanPhoneNumber } from "@/lib/profileHelpers";

// Regex de senha (igual ao backend)
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Schema de validação para cadastro de munícipe
 * Segue exatamente o UsuarioSchema do backend
 */
export const signupSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  
  email: z
    .string()
    .email("Formato de email inválido")
    .min(1, "Email é obrigatório"),
  
  senha: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(
      senhaRegex,
      "A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (@, $, !, %, *, ?, &)"
    ),
  
  confirmarSenha: z
    .string()
    .min(1, "Confirmação de senha é obrigatória"),
  
  data_nascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((data) => {
      // Aceita tanto YYYY-MM-DD (input date) quanto DD/MM/YYYY
      const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(data);
      const isBRFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(data);
      return isISOFormat || isBRFormat;
    }, "Formato de data inválido")
    .refine((data) => {
      let dataNasc: Date;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        // Formato YYYY-MM-DD
        const [ano, mes, dia] = data.split('-').map(Number);
        dataNasc = new Date(ano, mes - 1, dia);
      } else {
        // Formato DD/MM/YYYY
        const [dia, mes, ano] = data.split('/').map(Number);
        dataNasc = new Date(ano, mes - 1, dia);
      }
      
      const hoje = new Date();
      const idade = hoje.getFullYear() - dataNasc.getFullYear();
      const m = hoje.getMonth() - dataNasc.getMonth();
      
      if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
        return idade - 1 >= 18;
      }
      
      return idade >= 18;
    }, "Você deve ter pelo menos 18 anos"),
  
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine((cpf) => {
      const cleaned = cleanCPF(cpf);
      return cleaned.length === 11;
    }, "CPF deve ter 11 dígitos")
    .refine((cpf) => {
      const cleaned = cleanCPF(cpf);
      const validation = validateCPF(cleaned);
      return validation.valid;
    }, "CPF inválido"),
  
  celular: z
    .string()
    .min(1, "Celular é obrigatório")
    .refine((cel) => {
      const cleaned = cleanPhoneNumber(cel);
      return cleaned.length === 11;
    }, "Celular deve ter 11 dígitos"),
  
  nome_social: z
    .string()
    .optional(),
  
  endereco: z.object({
    logradouro: z
      .string()
      .min(1, "Logradouro é obrigatório")
      .min(2, "O logradouro deve ter pelo menos 2 caracteres"),
    
    cep: z
      .string()
      .min(1, "CEP é obrigatório")
      .refine((cep) => {
        const cleaned = cleanCEP(cep);
        return cleaned.length === 8;
      }, "CEP deve ter 8 dígitos")
      .refine((cep) => {
        const cleaned = cleanCEP(cep);
        const validation = validateCEPVilhena(cleaned);
        return validation.valid;
      }, "CEP deve ser de Vilhena-RO (76980-001 a 76989-999)"),
    
    bairro: z
      .string()
      .min(1, "Bairro é obrigatório"),
    
    numero: z
      .number({ message: "Número é obrigatório" })
      .int("O número deve ser inteiro")
      .positive("O número deve ser positivo"),
    
    complemento: z
      .string()
      .optional(),
    
    cidade: z
      .string()
      .min(1, "Cidade é obrigatória")
      .min(2, "A cidade deve ter pelo menos 2 caracteres"),
    
    estado: z
      .string()
      .min(1, "Estado é obrigatório")
      .length(2, "Estado deve ter 2 caracteres (UF)"),
  }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

export type SignupFormData = z.infer<typeof signupSchema>;

