import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { verifyAuth } from '../middlewares/authMiddleware';
import { verifyAdmin } from '../middlewares/adminMiddleware';
import { uploadUser } from '../middlewares/uploadUserMiddleware';

const router = Router();

/**
 * ==========================================
 * ROTAS DE UTILIZADORES
 * ==========================================
 */

/**
 * @route   GET /users
 * @desc    Listar todos os utilizadores cadastrados
 * @access  Privado (Restrito a administradores)
 */
router.get('/', verifyAuth, verifyAdmin, UserController.getAllUsers);

/**
 * @route   GET /users/:id
 * @desc    Obter os detalhes de um utilizador específico pelo ID
 * @access  Privado
 */
router.get('/:id', verifyAuth, UserController.getUserById);

/**
 * @route   PUT /users/:id
 * @desc    Atualizar os dados e/ou imagem de um utilizador por ID
 * @access  Privado
 */
router.put('/:id', verifyAuth, uploadUser.single('image'), UserController.updateUser);

/**
 * @route   DELETE /users/:id
 * @desc    Remover um utilizador do sistema pelo ID
 * @access  Privado (Admin)
 */
router.delete('/:id', verifyAuth, verifyAdmin, UserController.deleteUser);

export default router;