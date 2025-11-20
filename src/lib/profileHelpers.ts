/**
 * Helpers para página de perfil do usuário
 */

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date || date === 'Não informado') return 'Não informado';
  
  try {
    // Se já está em formato brasileiro (DD/MM/YYYY), retorna direto
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    
    // Se está em formato ISO ou timestamp, converte
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Não informado';
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  } catch {
    return 'Não informado';
  }
}

/**
 * Formata um telefone/celular com máscara
 * Aceita 10 ou 11 dígitos
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  }
  
  if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  
  if (cleaned.length <= 10) {
    // Formato: (00) 0000-0000
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  }
  
  // Formato: (00) 00000-0000
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

/**
 * Formata um CEP com máscara
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  if (cleaned.length <= 5) {
    return cleaned;
  }
  
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}

/**
 * Formata um CPF com máscara (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  if (cleaned.length <= 3) {
    return cleaned;
  }
  
  if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  }
  
  if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  }
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
}

/**
 * Remove a máscara de um telefone
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Remove a máscara de um CEP
 */
export function cleanCEP(cep: string): string {
  return cep.replace(/\D/g, '');
}

/**
 * Remove a máscara de um CPF
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida um número de telefone/celular
 */
export function validatePhoneNumber(phone: string): { valid: boolean; message?: string } {
  const cleaned = cleanPhoneNumber(phone);
  
  if (!cleaned) {
    return { valid: false, message: 'Celular é obrigatório' };
  }
  
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { valid: false, message: 'Celular deve ter 10 ou 11 dígitos' };
  }
  
  return { valid: true };
}

/**
 * Valida um CPF (verifica formato e dígitos verificadores)
 */
export function validateCPF(cpf: string): { valid: boolean; message?: string } {
  const cleaned = cleanCPF(cpf);
  
  if (!cleaned) {
    return { valid: false, message: 'CPF é obrigatório' };
  }
  
  if (cleaned.length !== 11) {
    return { valid: false, message: 'CPF deve ter 11 dígitos' };
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, message: 'CPF inválido' };
  }
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return { valid: false, message: 'CPF inválido' };
  }
  
  sum = 0;
  
  // Segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return { valid: false, message: 'CPF inválido' };
  }
  
  return { valid: true };
}

/**
 * Valida se o CEP é de Vilhena-RO
 * Vilhena: 76980-001 a 76989-999
 */
export function validateCEPVilhena(cep: string): { valid: boolean; message?: string } {
  const cleaned = cleanCEP(cep);
  
  if (!cleaned) {
    return { valid: false, message: 'CEP é obrigatório' };
  }
  
  if (cleaned.length !== 8) {
    return { valid: false, message: 'CEP deve ter 8 dígitos' };
  }
  
  const cepNumber = parseInt(cleaned);

  // Faixa de CEPs de Vilhena-RO: 76980001 a 76989999
  if (cepNumber < 76980001 || cepNumber > 76989999) {
    return { 
      valid: false, 
      message: 'CEP deve ser de Vilhena-RO (76980-001 a 76989-999)'
    };
  }
  
  return { valid: true };
}

/**
 * Valida um nome
 */
export function validateName(name: string): { valid: boolean; message?: string } {
  if (!name || !name.trim()) {
    return { valid: false, message: 'Nome é obrigatório' };
  }
  
  if (name.trim().length < 3) {
    return { valid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
  }
  
  return { valid: true };
}

/**
 * Obtém o tipo de usuário baseado no nível de acesso
 */
export function getUserType(user: unknown): string {
  if (!user || typeof user !== 'object' || !('nivel_acesso' in user)) return 'Não informado';
  const nivelAcesso = user.nivel_acesso as { municipe?: boolean; operador?: boolean; secretario?: boolean; administrador?: boolean } | undefined;
  if (!nivelAcesso) return 'Não informado';
  if (nivelAcesso.administrador) return 'Administrador';
  if (nivelAcesso.secretario) return 'Secretário';
  if (nivelAcesso.operador) return 'Operador';
  if (nivelAcesso.municipe) return 'Munícipe';
  return 'Não informado';
}

/**
 * Verifica se o usuário é munícipe
 */
export function isMunicipe(user: unknown): boolean {
  if (!user || typeof user !== 'object' || !('nivel_acesso' in user)) return false;
  const nivelAcesso = user.nivel_acesso as { municipe?: boolean } | undefined;
  return !!nivelAcesso?.municipe;
}

/**
 * Obtém um dado do usuário com fallback para "Não informado"
 */
export function getUserData(user: unknown, field: string): string | null {
  if (!user || typeof user !== 'object') return field === 'link_imagem' ? null : 'Não informado';
  
  const value = (user as Record<string, unknown>)[field];
  
  if (field === 'link_imagem') {
    return (value as string) || null;
  }
  
  return (value as string) || 'Não informado';
}

/**
 * Obtém um campo do endereço do usuário
 */
export function getUserEndereco(
  user: unknown, 
  field: string
): string | number {
  if (!user || typeof user !== 'object' || !('endereco' in user) || !user.endereco) {
    return field === 'numero' ? 0 : 'Não informado';
  }
  
  const endereco = user.endereco as Record<string, unknown>;
  const value = endereco[field] as string | number | undefined;
  return value !== undefined && value !== null ? value : (field === 'numero' ? 0 : 'Não informado');
}
