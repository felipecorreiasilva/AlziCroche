import { pool } from '../config/database';

export interface Favorite {
    id?: number;
    user_id: number;
    product_id: number;
    created_at?: Date;
}

export class FavoriteModel {
    // Buscar todos os favoritos de um usuário específico (incluindo dados do produto)
    static async findByUserId(userId: number) {
        const query = `
            SELECT f.id, f.product_id, p.name, p.price, p.image_url, p.category 
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            WHERE f.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // Verificar se um favorito específico já existe
    static async findOne(userId: number, productId: number) {
        const query = `SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2`;
        const result = await pool.query(query, [userId, productId]);
        return result.rows[0] || null;
    }

    // Adicionar um favorito
    static async create(userId: number, productId: number) {
        const query = `
            INSERT INTO favorites (user_id, product_id) 
            VALUES ($1, $2) 
            RETURNING id, user_id, product_id, created_at
        `;
        const result = await pool.query(query, [userId, productId]);
        return result.rows[0];
    }

    // Remover um favorito
    static async delete(userId: number, productId: number) {
        const query = `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2`;
        const result = await pool.query(query, [userId, productId]);
        return (result.rowCount ?? 0) > 0;
    }
}