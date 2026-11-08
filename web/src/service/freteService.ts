import api from './api'; // ou o seu cliente HTTP configurado para o server

interface ItemCarrinho {
  id: string | number;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

interface CalcularFreteDTO {
  postal_code_destination: string;
  products: ItemCarrinho[];
}

export const freteService = {
  async calcular(dados: CalcularFreteDTO) {
    try {
      const response = await api.post('/shipping/calculate', dados);
      return response.data; // Retorna as opções de frete (PAC, SEDEX, etc.) validadas pelo server
    } catch (error: any) {
      console.error('Erro ao calcular frete no front-end:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Não foi possível calcular o frete.');
    }
  },
};