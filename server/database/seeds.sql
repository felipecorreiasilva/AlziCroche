-- Inserir usuário administrador padrão com o CPF, endereço real de Uberlândia - MG
INSERT INTO users (id, name, email, password_hash, role, cpf, image_url, phone, cep, city, state, neighborhood, address, number, complement) 
VALUES (
    1, 
    'Alzi Administradora', 
    'admin@alzicroche.com', 
    '$2b$10$7h3pvq9oW3GAIQR6kwAY/OmUli/9spQmtVSTKEgJlWklygzF91H3y', 
    'admin', 
    '123.456.789-00',
    NULL, 
    '75988158166',
    '38413-675',
    'Uberlândia',
    'MG',
    'Panorama',
    'Rua do Calistemon',
    '363',
    'Apartamento 312 Bloco C'
) ON CONFLICT (id) DO NOTHING;

-- Inserir as 4 bolsas de crochê com peso e dimensões logísticas para o Melhor Envio
INSERT INTO products (name, description, price, category, image_url, weight, width, height, length) 
VALUES 
(
    'Bolsa Transversal Marrom Texturizada', 
    'Bolsa tiracolo artesanal em tons de marrom e bege, estruturada com alça longa e detalhe de flor em crochê com pérola.', 
    149.90, 
    'Bolsas', 
    '/uploads/products/bolsa-marrom-texturizada.jpeg',
    0.450, 20.00, 15.00, 25.00
),
(
    'Bolsa Transversal Pêssego e Bege', 
    'Bolsa charmosa em tons pastéis de pêssego e bege, equipada com alça confortável e aplicação delicada de flor artesanal.', 
    139.90, 
    'Bolsas', 
    '/uploads/products/bolsa-pessego.jpeg',
    0.400, 20.00, 15.00, 25.00
),
(
    'Bolsa Saco Azul Degradê', 
    'Bolsa modelo saco confeccionada em fios azul royal e marinho com efeito degradê e fechamento ajustável por cordão trançado.', 
    129.90, 
    'Bolsas', 
    '/uploads/products/bolsa-saco-azul.jpeg',
    0.500, 22.00, 18.00, 22.00
),
(
    'Bolsa de Ombro Geométrica Caramelo', 
    'Bolsa sofisticada em tom caramelo com padrão geométrico em relevo, alça trabalhada e placa metálica personalizada "Feito à Mão".', 
    169.90, 
    'Bolsas', 
    '/uploads/products/bolsa-geometrica-caramelo.jpeg',
    0.550, 25.00, 15.00, 30.00
);