import { api } from "./api";

export interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  created_at?: string | Date;
}

export const ProductService = {
    // 1. READ (ALL) - Buscar todos os produtos
    async getAllProducts(): Promise<Product[]>{
        const response = await api.get('/products');
        return response.data;
    },

    // 2. READ (ONE) - Buscar um produto por ID
    async getProductById(id: number): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // 3. CREATE - Criar um novo produto
    async createProduct(product: Product): Promise<Product> {
        const response = await api.post('/products', product);
        return response.data
    },

    // 4. UPDATE - Atualizar um produto existente
    async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
        const response = await api.put(`/products/${id}`, product);
        return response.data;
    },

    // 5. DELETE - Remover um produto
    async deleteProduct(id: number): Promise<void>{
      await api.delete(`/products/${id}`);  
    }
}