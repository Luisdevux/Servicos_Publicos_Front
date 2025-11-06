/**
 * Hook personalizado para busca de CEP com validação de Vilhena-RO
 */

import { useState } from 'react';
import { viaCepService } from '@/services/viaCepService';
import { validateCEPVilhena, formatCEP, cleanCEP } from '@/lib/profileHelpers';
import { toast } from 'sonner';

interface CepData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export function useCepVilhena() {
  const [isLoading, setIsLoading] = useState(false);
  const [cepEncontrado, setCepEncontrado] = useState<string | null>(null);

  const buscarCep = async (cep: string): Promise<CepData | null> => {
    const cepLimpo = cleanCEP(cep);

    // Validar se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      setCepEncontrado(null);
      return null;
    }

    // Validar se o CEP é de Vilhena-RO
    const cepValidation = validateCEPVilhena(cepLimpo);
    if (!cepValidation.valid) {
      toast.error(cepValidation.message || 'CEP deve ser de Vilhena-RO');
      setCepEncontrado(null);
      return null;
    }

    setIsLoading(true);
    toast.loading('Buscando endereço...', { id: 'cep-loading' });

    try {
      const endereco = await viaCepService.buscarEnderecoPorCep(cepLimpo);

      toast.dismiss('cep-loading');

      if (endereco) {
        toast.success('Endereço encontrado!');
        setCepEncontrado(cepLimpo);
        return {
          logradouro: endereco.logradouro || '',
          bairro: endereco.bairro || '',
          cidade: endereco.localidade || 'Vilhena',
          estado: endereco.uf || 'RO',
        };
      } else {
        toast.error('CEP não encontrado. Verifique o número digitado.');
        setCepEncontrado(null);
        return null;
      }
    } catch (error) {
      toast.dismiss('cep-loading');
      toast.error('Erro ao buscar CEP');
      console.error('Erro ao buscar CEP:', error);
      setCepEncontrado(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const formatarCep = (cep: string): string => {
    return formatCEP(cep);
  };

  const validarCep = (cep: string): { valid: boolean; message?: string } => {
    const cepLimpo = cleanCEP(cep);
    if (cepLimpo.length !== 8) {
      return { valid: false, message: 'CEP deve ter 8 dígitos' };
    }
    return validateCEPVilhena(cepLimpo);
  };

  const validarCepEncontrado = (cep: string): { valid: boolean; message?: string } => {
    const cepLimpo = cleanCEP(cep);
    
    // Primeiro valida se está na faixa de Vilhena
    const rangeValidation = validarCep(cepLimpo);
    if (!rangeValidation.valid) {
      return rangeValidation;
    }
    
    // Depois valida se o CEP foi encontrado no ViaCEP
    if (cepEncontrado !== cepLimpo) {
      return { 
        valid: false, 
        message: 'CEP não encontrado. Digite um CEP válido de Vilhena-RO.' 
      };
    }
    
    return { valid: true };
  };

  return {
    buscarCep,
    formatarCep,
    validarCep,
    validarCepEncontrado,
    isLoading,
    cepEncontrado,
  };
}
