import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { uploadUser } from '../middlewares/uploadUserMiddleware';

const router = Router();

// Rota para registar um novo utilizador e receber o token inicial (com suporte opcional a upload de imagem)
router.post('/register', uploadUser.single('image'), AuthController.register);

// Rota para autenticar um utilizador existente e gerar o token JWT
router.post('/login', AuthController.login);

export default router;