-- Extensão para UUID (caso queira manter UUID, ou SERIAL conforme sua preferência)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Utilizadores / Usuários com endereço completo adicionado
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'client', -- 'client', 'admin'
    image_url VARCHAR(255),
    phone VARCHAR(20),
    cep VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(2),
    neighborhood VARCHAR(100), -- Bairro
    address VARCHAR(255),      -- Rua / Logradouro
    number VARCHAR(20),        -- Número
    complement VARCHAR(100),   -- Apto, Bloco, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos/Peças de Crochê com a categoria
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Ex: Tapetes, Amigurumis, Vestuário, Decoração
    image_url TEXT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);