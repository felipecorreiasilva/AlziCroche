import api from "./api";
import { RegisterDTO, LoginDTO } from "@/types/user";
import { tokenService } from "./tokenService";

export const AuthService = {
  // Registrar novo usuário
  async register(data: RegisterDTO): Promise<string> {
    const response = await api.post("/auth/register", data);
    
    const result = response.data;
    const token = typeof result === "string" ? result : result.token;

    if (token) {
      tokenService.setToken(token);
    }

    return token;
  },

  // Fazer login
  async login(data: LoginDTO): Promise<string> {
    const response = await api.post("/auth/login", data);
    
    const result = response.data;
    const token = typeof result === "string" ? result : result.token;

    if (token) {
      tokenService.setToken(token);
    }

    return token;
  }
};