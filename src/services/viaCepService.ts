// src/services/viaCepService.ts

// Service para integração com API ViaCEP

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const viaCepService = {

  async buscarEnderecoPorCep(cep: string): Promise<ViaCepResponse | null> {
    try {
      // Remove caracteres não numéricos
      const cepLimpo = cep.replace(/\D/g, '');

      // Valida tamanho do CEP
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  },

  async buscarCepsPorEndereco(
    uf: string,
    cidade: string,
    logradouro: string
  ): Promise<ViaCepResponse[]> {
    try {
      // Validação mínima de 3 caracteres para evitar muitos resultados
      if (logradouro.length < 3) {
        return [];
      }

      const url = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(
        cidade
      )}/${encodeURIComponent(logradouro)}/json/`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar endereços');
      }

      const data = await response.json();

      // Se retornar objeto com erro, não há resultados
      if (data.erro || !Array.isArray(data)) {
        return [];
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      return [];
    }
  },

  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return cep;
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  },
};

