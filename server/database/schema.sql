-- Tabela de Utilizadores / Usuários com CPF e endereço completo adicionados
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'client', -- 'client', 'admin'
    cpf VARCHAR(14) UNIQUE,          -- CPF do utilizador (com ou sem formatação)
    image_url VARCHAR(255),
    phone VARCHAR(20),
    cep VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(2),
    neighborhood VARCHAR(100),        -- Bairro
    address VARCHAR(255),             -- Rua / Logradouro
    number VARCHAR(20),               -- Número
    complement VARCHAR(100),          -- Apto, Bloco, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de Produtos com dimensões e peso obrigatórios (NOT NULL) para a API do Melhor Envio
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,    -- Categoria do produto
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    -- Campos de logística / dimensões obrigatórios para o Melhor Envio
    weight DECIMAL(10,3) NOT NULL DEFAULT 0.300, -- Peso em kg (ex: 300g = 0.3)
    width DECIMAL(10,2) NOT NULL DEFAULT 15.00,  -- Largura em cm
    height DECIMAL(10,2) NOT NULL DEFAULT 10.00, -- Altura em cm
    length DECIMAL(10,2) NOT NULL DEFAULT 20.00, -- Comprimento em cm
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

-- Tabela de Pedidos (AlziCrochê)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,     -- Relaciona com a tabela de usuários (caso exista)
    txid VARCHAR(255) UNIQUE,                                -- Identificador único da transação (ex: Pix txid)
    
    -- Snapshot dos dados do cliente no momento da compra
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_cpf VARCHAR(14) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Endereço de Entrega (Snapshot)
    cep VARCHAR(10) NOT NULL,
    address VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(255),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,

    -- Frete e Valores
    shipping_service VARCHAR(50) NOT NULL,     -- Ex: PAC, SEDEX (Melhor Envio)
    shipping_cost DECIMAL(10, 2) NOT NULL,     -- Valor do frete
    subtotal DECIMAL(10, 2) NOT NULL,          -- Subtotal dos produtos
    total DECIMAL(10, 2) NOT NULL,             -- Total geral (produtos + frete)

    -- Pagamento e Status
    payment_method VARCHAR(30) NOT NULL,       -- pix, credit_card, debit_card
    status VARCHAR(50) DEFAULT 'pending',      -- pending, approved, cancelled, refunded
    
    -- Itens do pedido salvos em JSON (mantém o histórico exato dos produtos e preços pagos)
    items JSONB NOT NULL,                      

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para agilizar buscas
CREATE INDEX IF NOT EXISTS idx_orders_txid ON orders(txid);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);