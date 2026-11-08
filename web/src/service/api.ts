import axios from 'axios';
import { tokenService } from './tokenService'; // Importa o seu tokenService

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 1. Interceptor de Requisição: Injeta automaticamente o token JWT usando o tokenService
api.interceptors.request.use(
    (config) => {
        const token = tokenService.getToken(); // Usa a chave correta (@AlziCrochê:token)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Interceptor de Resposta: Trata erros globais (como token expirado/inválido)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isLoginRoute = error.config?.url?.includes('/auth/login');

            if (!isLoginRoute && typeof window !== 'undefined') {
                tokenService.removeToken(); // Remove usando o serviço correto
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;