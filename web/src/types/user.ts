export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'admin';
  cpf?: string | null;
  image_url?: string | null;
  phone?: string | null;
  cep?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  created_at?: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
  cep?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  address?: string;
  number?: string;
  complement?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Retorna apenas a string do token
export type AuthResponse = string;