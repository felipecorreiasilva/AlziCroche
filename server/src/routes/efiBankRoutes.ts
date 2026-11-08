import { Router } from 'express';
import { EfiController } from '../controllers/efiBankController';
import { verifyAuth } from '../middlewares/authMiddleware'; // Ajuste o caminho do import se necessário

const router = Router();

// Rota de pagamento protegida por autenticação (exige usuário logado)
router.post('/efi/pay', verifyAuth, EfiController.processPayment);

export default router;