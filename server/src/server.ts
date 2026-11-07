import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import productRoutes from './routes/productRoutes';
import favoriteRoutes from './routes/favoriteRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Configurar rota estática para servir as imagens da pasta uploads/products
// Exemplo de acesso: http://localhost:3333/uploads/products/nome-da-imagem.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rotas da API
app.use('/products', productRoutes);
app.use('/favorites', favoriteRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API AlziCrochê rodando com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});