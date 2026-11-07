'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      // Simulação de cadastro (substitua pela chamada real ao seu UserService ou API)
      console.log("Cadastrando usuário:", { name, email, password });
      
      // Exemplo de redirecionamento após sucesso
      alert("Conta criada com sucesso!");
      router.push("/login");
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError("Ocorreu um erro ao criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0F172A] pt-40 pb-20 px-4 text-slate-800">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-100">
        
        {/* Cabeçalho do Formulário */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Crie sua Conta
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Junte-se à AlziCrochê e tenha acesso a peças exclusivas
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FaUser className="text-slate-400 text-xs" /> Nome Completo
            </label>
            <input
              className="border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] p-3 rounded-xl text-sm outline-none transition-all"
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FaEnvelope className="text-slate-400 text-xs" /> E-mail
            </label>
            <input
              className="border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] p-3 rounded-xl text-sm outline-none transition-all"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FaLock className="text-slate-400 text-xs" /> Senha
            </label>
            <input
              className="border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] p-3 rounded-xl text-sm outline-none transition-all"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : (
              <>
                Criar Conta <FaArrowRight className="text-xs" />
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Card (Link para Login) */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500">
            Já possui uma conta?{" "}
            <Link href="/login" className="text-[#0F172A] font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}