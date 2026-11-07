import { Request, Response } from 'express';
import { FavoriteModel } from '../models/Favorite';

export class FavoriteController {
    
    // Listar todos os favoritos do usuário logado
    static async getFavorites(req: Request, res: Response): Promise<Response> {
        try {
            // O ID do usuário geralmente vem do middleware de autenticação (ex: req.user.id)
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado." });
            }

            const favorites = await FavoriteModel.findByUserId(userId);
            return res.status(200).json(favorites);
        } catch (error: any) {
            console.error("Erro ao buscar favoritos:", error);
            return res.status(500).json({ message: "Erro interno no servidor ao buscar favoritos." });
        }
    }

    // Alternar favorito (Toggle: se já existe, remove; se não existe, adiciona)
    static async toggleFavorite(req: Request, res: Response): Promise<Response> {
        try {
            const userId = (req as any).user?.id;
            const { productId } = req.body;

            if (!userId) {
                return res.status(401).json({ message: "Usuário não autenticado." });
            }

            if (!productId) {
                return res.status(400).json({ message: "O ID do produto é obrigatório." });
            }

            // Verifica se já existe nos favoritos
            const existingFavorite = await FavoriteModel.findOne(userId, Number(productId));

            if (existingFavorite) {
                // Se já existe, remove
                await FavoriteModel.delete(userId, Number(productId));
                return res.status(200).json({ message: "Produto removido dos favoritos com sucesso.", favorited: false });
            } else {
                // Se não existe, cria
                const newFavorite = await FavoriteModel.create(userId, Number(productId));
                return res.status(201).json({ message: "Produto adicionado aos favoritos com sucesso.", favorited: true, favorite: newFavorite });
            }

        } catch (error: any) {
            console.error("Erro ao alternar favorito:", error);
            return res.status(500).json({ message: "Erro interno no servidor ao processar favorito." });
        }
    }
}