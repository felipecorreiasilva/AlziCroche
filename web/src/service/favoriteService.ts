import api from './api';

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
}

export interface Favorite {
    id: number;
    product_id: number;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
}

export const FavoriteService = {
    // Buscar todos os favoritos do usuário logado
    async getFavorites(): Promise<Favorite[]> {
        const response = await api.get('/favorites');
        return response.data;
    },

    // Alternar favorito (adiciona ou remove)
    async toggleFavorite(productId: number): Promise<{ message: string; favorited: boolean }> {
        const response = await api.post('/favorites/toggle', { productId });
        return response.data;
    }
};