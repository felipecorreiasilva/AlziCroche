import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';

export class OrderController {

    // Listar todos os pedidos
    static async getAllOrders(req: Request, res: Response) {
        try {
            const orders = await OrderModel.findAll();
            return res.status(200).json(orders);
        } catch (error: any) {
            console.error('Erro ao listar pedidos:', error.message);
            return res.status(500).json({ error: 'Erro interno ao buscar pedidos.' });
        }
    }

    // Buscar pedido específico por ID
    static async getOrderById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const order = await OrderModel.findById(Number(id));

            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            return res.status(200).json(order);
        } catch (error: any) {
            console.error('Erro ao buscar pedido:', error.message);
            return res.status(500).json({ error: 'Erro interno ao buscar pedido.' });
        }
    }

    // Atualizar status do pedido manualmente (ex: Painel Admin)
    static async updateOrderStatus(req: Request, res: Response) {
        try {
            const { txid } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: 'Novo status não informado.' });
            }

            if (!txid) {
                return res.status(400).json({ error: 'Txid não informado nos parâmetros.' });
            }

            const updatedOrder = await OrderModel.updateStatus(String(txid), status);

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Pedido não encontrado com o txid informado.' });
            }

            return res.status(200).json({
                success: true,
                message: 'Status do pedido atualizado com sucesso!',
                order: updatedOrder
            });
        } catch (error: any) {
            console.error('Erro ao atualizar pedido:', error.message);
            return res.status(500).json({ error: 'Erro interno ao atualizar pedido.' });
        }
    }

    // Excluir pedido
    static async deleteOrder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deletedOrder = await OrderModel.delete(Number(id));

            if (!deletedOrder) {
                return res.status(404).json({ error: 'Pedido não encontrado.' });
            }

            return res.status(200).json({
                success: true,
                message: 'Pedido removido com sucesso!'
            });
        } catch (error: any) {
            console.error('Erro ao excluir pedido:', error.message);
            return res.status(500).json({ error: 'Erro interno ao excluir pedido.' });
        }
    }
}