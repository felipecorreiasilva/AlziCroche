'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, LoginDTO, RegisterDTO } from '@/types/user';
import { AuthService } from '@/service/authService';
import { userService } from '@/service/userService';
import { tokenService } from '@/service/tokenService';
import { useRouter } from 'next/navigation';

interface JwtPayload {
    id: number;
    sub?: number;
    email: string;
    role: string;
}

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginDTO) => Promise<void>;
    register: (data: RegisterDTO) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchAndSetUser = async (token: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const userId = decoded.id || decoded.sub;
            if (userId) {
                // Se o seu interceptor do axios já estiver a injetar o token, isto funcionará perfeitamente ao recarregar a página
                const fullUser = await userService.getUserById(userId);
                setUser(fullUser);
            }
        } catch (error) {
            console.error('Erro ao buscar dados completos do utilizador:', error);
            tokenService.removeToken();
            setUser(null);
        }
    };

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const token = tokenService.getToken();
                if (token) {
                    await fetchAndSetUser(token);
                }
            } catch (error) {
                tokenService.removeToken();
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredData();
    }, []);

    const login = async (credentials: LoginDTO) => {
        setIsLoading(true);
        try {
            // O AuthService já chama o tokenService.setToken internamente
            await AuthService.login(credentials);
            
            // Como o token acabou de ser guardado, podemos buscar os dados do utilizador logo em seguida
            const token = tokenService.getToken();
            if (token) {
                await fetchAndSetUser(token);
            }

            router.push('/');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterDTO) => {
        setIsLoading(true);
        try {
            await AuthService.register(data);
            const token = tokenService.getToken();
            if (token) {
                await fetchAndSetUser(token);
            }
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        tokenService.removeToken();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}