import api from './api';

export interface IOrderItem {
  product_id: number;
  name: number | string;
  price: number;
  quantity: number;
}

export interface IPaymentData {
  method: 'pix' | 'credit_card' | 'debit_card';
  card_details?: {
    number: string;
    expiry: string; // Formato "MM/AA"
    cvv: string;
    name: string;
  };
}

export interface IEfiPaymentPayload {
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  address: {
    cep: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: {
    service: string;
    cost: number;
  };
  items: IOrderItem[];
  subtotal: number;
  total: number;
  payment: IPaymentData;
}

export const EfiBankService = {
  
  // Processa o pagamento unificado (Pix, Crédito ou Débito) e gera o pedido no backend
  async processPayment(payload: IEfiPaymentPayload) {
    try {
      const response = await api.post('/efi/pay', payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erro ao processar o pagamento com a Efí.' };
    }
  }

};