import { pool } from '../config/database';

export interface IOrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrderData {
  user_id?: number | null;
  txid?: string;
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  customer_phone: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  shipping_service: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_method: string;
  status?: string;
  items: IOrderItem[];
}

export class OrderModel {
  
  // CREATE: Cria um novo pedido
  static async create(orderData: IOrderData) {
    const query = `
      INSERT INTO orders (
        user_id, txid, customer_name, customer_email, customer_cpf, customer_phone,
        cep, address, number, complement, neighborhood, city, state,
        shipping_service, shipping_cost, subtotal, total,
        payment_method, status, items
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *;
    `;

    const values = [
      orderData.user_id || null,
      orderData.txid || null,
      orderData.customer_name,
      orderData.customer_email,
      orderData.customer_cpf,
      orderData.customer_phone,
      orderData.cep,
      orderData.address,
      orderData.number,
      orderData.complement || null,
      orderData.neighborhood,
      orderData.city,
      orderData.state,
      orderData.shipping_service,
      orderData.shipping_cost,
      orderData.subtotal,
      orderData.total,
      orderData.payment_method,
      orderData.status || 'pending',
      JSON.stringify(orderData.items)
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // READ: Lista todos os pedidos (com paginação opcional ou geral)
  static async findAll() {
    const query = `SELECT * FROM orders ORDER BY created_at DESC;`;
    const { rows } = await pool.query(query);
    return rows;
  }

  // READ: Busca pedido por ID numérico
  static async findById(id: number) {
    const query = `SELECT * FROM orders WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  // READ: Busca pedido pelo txid (usado pelo Webhook da Efí)
  static async findByTxid(txid: string) {
    const query = `SELECT * FROM orders WHERE txid = $1;`;
    const { rows } = await pool.query(query, [txid]);
    return rows[0];
  }

  // UPDATE: Atualiza o status do pedido
  static async updateStatus(txid: string, status: string) {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE txid = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, txid]);
    return rows[0];
  }

  // DELETE: Remove um pedido (caso necessário em testes/cancelamento)
  static async delete(id: number) {
    const query = `DELETE FROM orders WHERE id = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}