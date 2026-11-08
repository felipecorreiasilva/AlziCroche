import axios from 'axios';

interface ShippingItem {
  id: string | number;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

interface CalculateShippingDTO {
  postal_code_destination: string;
  products: ShippingItem[];
}

export class MelhorEnvioService {
  private static getToken(): string {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) {
      throw new Error('MELHOR_ENVIO_TOKEN não está configurado nas variáveis de ambiente.');
    }
    return token;
  }

  // Defina como true se estiver a usar o ambiente de Sandbox do Melhor Envio
  private static isSandbox(): boolean {
    return process.env.MELHOR_ENVIO_SANDBOX === 'true';
  }

  private static getBaseUrl(): string {
    return this.isSandbox()
      ? 'https://sandbox.melhorenvio.com.br/api/v2/me'
      : 'https://melhorenvio.com.br/api/v2/me';
  }

  static async calculateShipping(data: CalculateShippingDTO) {
    const token = this.getToken();
    const baseUrl = this.getBaseUrl();

    // CEP de origem fixo da AlziCrochê (Panorama, Uberlândia - MG)
    const originPostalCode = '38413675';

    const payload = {
      from: {
        postal_code: originPostalCode,
      },
      to: {
        postal_code: data.postal_code_destination.replace(/\D/g, ''),
      },
      products: data.products.map((item) => ({
        id: String(item.id),
        width: item.width,
        height: item.height,
        length: item.length,
        weight: item.weight,
        insurance_value: item.insurance_value,
        quantity: item.quantity,
      })),
      // Opcional: filtrar apenas Correios (PAC = 1, SEDEX = 2) ou deixar aberto
      services: '1,2', 
    };

    try {
      const response = await axios.post(`${baseUrl}/shipment/calculate`, payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'AlziCroche (contato@alzicroche.com)',
        },
      });

      // Retorna apenas as opções válidas (que não tiveram erro na cotação)
      const validOptions = response.data.filter((option: any) => !option.error);
      return validOptions;
    } catch (error: any) {
      console.error('Erro ao calcular frete no Melhor Envio:', error.response?.data || error.message);
      throw new Error('Não foi possível calcular o frete no momento. Tente novamente mais tarde.');
    }
  }
}