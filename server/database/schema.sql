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

-- Criação da tabela de Produtos (Cardápio)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'hamburgueres', 'acompanhamentos', 'bebidas'
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Garante que um usuário não pode favoritar o mesmo produto duplicado
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id),
    
    -- Chaves estrangeiras (ajuste os nomes das tabelas conforme o seu banco)
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);