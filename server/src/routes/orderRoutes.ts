import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { verifyAuth } from '../middlewares/authMiddleware'; // Ajuste o caminho do import se necessário
import { verifyAdmin } from '../middlewares/adminMiddleware'; // Ajuste o caminho do import se necessário

const router = Router();

// Listar todos os pedidos (Exigir autenticação / ou admin)
router.get('/orders', verifyAuth, verifyAdmin, OrderController.getAllOrders);

// Buscar pedido específico por ID
router.get('/orders/:id', verifyAuth, OrderController.getOrderById);

// Atualizar status do pedido (Geralmente acionado por Webhook ou Admin)
router.patch('/orders/:txid/status', verifyAuth, verifyAdmin, OrderController.updateOrderStatus);

// Excluir pedido (Restrito a administradores)
router.delete('/orders/:id', verifyAuth, verifyAdmin, OrderController.deleteOrder);

export default router;