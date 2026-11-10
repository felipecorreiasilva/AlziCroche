import { Router } from 'express';
import { EfiController } from '../controllers/EfiBankController';
import { verifyAuth } from '../middlewares/authMiddleware';

const router = Router();

// Rota de pagamento protegida por autenticação (exige usuário logado)
router.post('/efi/pay', verifyAuth, EfiController.processPayment);

// Rota de Webhook do Pix (Chamada pela Efí - NÃO PODE TER verifyAuth)
router.post('/efi/webhook', EfiController.webhook);

// Rota opcional para configurar/registrar o webhook na Efí (Protegida ou aberta, conforme sua preferência)
router.post('/efi/config-webhook', verifyAuth, EfiController.configurarWebhook);

export default router;