-- Inserir usuário administrador padrão para associar aos produtos. Senha Padrão: 12345678
INSERT INTO users (id, name, email, password_hash, role, image_url, phone) 
VALUES (
    1, 
    'Alzi Administradora', 
    'admin@alzicroche.com', 
    '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 
    'admin', 
    'https://exemplo.com/perfil-admin.jpg', 
    '75988158166'
) ON CONFLICT (id) DO NOTHING;

-- Inserir as 4 bolsas de crochê baseadas nas imagens enviadas
INSERT INTO products (title, description, price, category, image_url, user_id) 
VALUES 
(
    'Bolsa Transversal Marrom Texturizada', 
    'Bolsa tiracolo artesanal em tons de marrom e bege, estruturada com alça longa e detalhe de flor em crochê com pérola.', 
    149.90, 
    'Bolsas', 
    'https://exemplo.com/bolsa-marrom-texturizada.jpg', 
    1
),
(
    'Bolsa Transversal Pêssego e Bege', 
    'Bolsa charmosa em tons pastéis de pêssego e bege, equipada com alça confortável e aplicação delicada de flor artesanal.', 
    139.90, 
    'Bolsas', 
    'https://exemplo.com/bolsa-pessego.jpg', 
    1
),
(
    'Bolsa Saco Azul Degradê', 
    'Bolsa modelo saco confeccionada em fios azul royal e marinho com efeito degradê e fechamento ajustável por cordão trançado.', 
    129.90, 
    'Bolsas', 
    'https://exemplo.com/bolsa-saco-azul.jpg', 
    1
),
(
    'Bolsa de Ombro Geométrica Caramelo', 
    'Bolsa sofisticada em tom caramelo com padrão geométrico em relevo, alça trabalhada e placa metálica personalizada "Feito à Mão".', 
    169.90, 
    'Bolsas', 
    'https://exemplo.com/bolsa-geometrica-caramelo.jpg', 
    1
);