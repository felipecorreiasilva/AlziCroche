import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { verifyAuth } from '../middlewares/authMiddleware'; // Ajuste o caminho do seu middleware de autenticação

const router = Router();

// Todas as rotas de favoritos exigem que o usuário esteja autenticado
router.use(verifyAuth);

// Rota para listar todos os favoritos do usuário logado
router.get('/', FavoriteController.getFavorites);

// Rota para alternar favorito (adiciona se não existir, remove se já existir)
router.post('/toggle', FavoriteController.toggleFavorite);

export default router;