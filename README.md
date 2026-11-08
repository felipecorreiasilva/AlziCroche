# 🧶 AlziCrochê — Sistema E-commerce Multiplataforma

O **AlziCrochê** é um ecossistema completo de e-commerce voltado para a comercialização de peças artesanais exclusivas em crochê. O projeto foi arquitetado para oferecer alta performance e uma experiência unificada em múltiplas plataformas: Web, Mobile, Desktop e um Servidor de API robusto.

---

## 🚀 Tecnologias Utilizadas

### **Backend (`/server`)**
* **Node.js** com **Express.js** (TypeScript)
* **PostgreSQL** (Gestão relacional de dados)
* **JWT (JSON Web Token)** & **Bcrypt** (Autenticação e segurança)
* **Multer** (Upload e gestão de ficheiros/avatares/produtos)

### **Frontend Web (`/web`)**
* **Next.js** (App Router)
* **Tailwind CSS** (Estilização responsiva e design system em `#0F172A` e branco com detalhes em âmbar)
* **React Context API** (Gestão de estado global e carrinho persistente)
* **React Icons**

### **Mobile (`/mobile`)**
* **Expo / React Native**

### **Desktop (`/desktop`)**
* **Electron.js**

---

⚙️ Pré-requisitos

- Node.js (versão 18+ recomendada)
- PostgreSQL configurado e rodando localmente ou na nuvem

✨ Funcionalidades Principais

- Catálogo Dinâmico: Listagem de produtos artesanais consumidos diretamente da API.
- Carrinho Global com Persistência: Adição de itens, controle de quantidade e persistência via sessionStorage / Context API.
- Gaveta de Carrinho Lateral (CartModal): Interface fluida integrada ao layout global com acesso rápido aos totais e checkout.
- Autenticação Segura: Registo e Login com senhas criptografadas via bcrypt e sessões validadas por JWT.
- Perfis e Endereços: Gestão completa de dados de utilizador, perfis (Client/Admin) e moradas de entrega.

👨‍💻 Autor
Desenvolvido com dedicação por Felipe Correia Silva.

## 📁 Estrutura do Projeto

```text
AlziCrochê/
├── server/       # API RESTful (Express.js + PostgreSQL)
├── web/          # Aplicação Web (Next.js App Router)
├── mobile/       # Aplicativo Mobile (Expo React Native)
└── desktop/      # Aplicação Desktop (Electron.js)