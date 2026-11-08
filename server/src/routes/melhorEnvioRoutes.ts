import { Router } from 'express';
import { MelhorEnvioController } from '../controllers/MelhorEnvioController';

const router = Router();

// Rota POST para calcular frete
router.post('/calculate', MelhorEnvioController.calculate);

export default router;