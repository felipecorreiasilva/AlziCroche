import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

const router = Router();

router.get('/orders', OrderController.getAllOrders);
router.get('/orders/:id', OrderController.getOrderById);
router.patch('/orders/:txid/status', OrderController.updateOrderStatus);
router.delete('/orders/:id', OrderController.deleteOrder);

export default router;