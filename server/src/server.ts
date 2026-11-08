import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import productRoutes from './routes/productRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import melhorEnvioRoutes from './routes/melhorEnvioRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Configurar rota estática para servir as imagens da pasta uploads
// Exemplo de acesso: http://localhost:3333/uploads/products/... ou /uploads/users/...
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/products', productRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/auth', authRoutes);       // Rotas de autenticação (/auth/login, /auth/register)
app.use('/users', userRoutes);     // Rotas de gestão de utilizadores (/users, /users/:id)
app.use('/shipping', melhorEnvioRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API AlziCrochê rodando com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});