export interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  created_at?: string | Date;
  
  // Propriedades para cálculo de frete (Melhor Envio / Logística)
  weight?: number;   // Peso em kg (ex: 0.3)
  width?: number;    // Largura em cm (ex: 15)
  height?: number;   // Altura em cm (ex: 10)
  length?: number;   // Comprimento em cm (ex: 20)
}