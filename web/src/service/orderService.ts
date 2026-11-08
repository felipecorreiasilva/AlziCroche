import api from './api';

export interface IOrderItem {
  product_id: number;
  name: string | number;
  price: number;
  quantity: number;
}

export const OrderService = {
  
  // 1. READ: Listar todos os pedidos (GET /orders)
  async getAllOrders() {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erro ao listar pedidos.' };
    }
  },

  // 2. READ: Buscar pedido específico por ID (GET /orders/:id)
  async getOrderById(id: string | number) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erro ao buscar detalhes do pedido.' };
    }
  },

  // 3. UPDATE: Atualizar o status do pedido via txid (PATCH /orders/:txid/status)
  async updateOrderStatus(txid: string, status: string) {
    try {
      const response = await api.patch(`/orders/${txid}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erro ao atualizar o status do pedido.' };
    }
  },

  // 4. DELETE: Remover um pedido por ID (DELETE /orders/:id)
  async deleteOrder(id: string | number) {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Erro ao excluir o pedido.' };
    }
  }
};