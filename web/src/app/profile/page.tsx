'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/service/userService";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHome, FaCity, FaSave, FaSpinner, FaCamera } from "react-icons/fa";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, checkUser } = useAuth() as any;
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cep: "",
        city: "",
        state: "",
        neighborhood: "",
        address: "",
        number: "",
        complement: ""
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Preenche o formulário assim que os dados do utilizador forem carregados no contexto
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                cep: user.cep || "",
                city: user.city || "",
                state: user.state || "",
                neighborhood: user.neighborhood || "",
                address: user.address || "",
                number: user.number || "",
                complement: user.complement || ""
            });
            if (user.image_url) {
                setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${user.image_url}`);
            }
        }
    }, [user]);

    // Função para formatar o CEP visualmente (00000-000)
    const formatCep = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 8) {
            return numbers.replace(/(\d{5})(\d{1,3})?/, "$1-$2").replace(/-$/, "");
        }
        return numbers.slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2");
    };

    // Consulta à API ViaCEP
    const fetchAddressByCep = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, "");
        if (cleanCep.length !== 8) return;

        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData((prev) => ({
                    ...prev,
                    address: data.logradouro || prev.address,
                    neighborhood: data.bairro || prev.neighborhood,
                    city: data.localidade || prev.city,
                    state: data.uf || prev.state,
                }));
            } else {
                setMessage({ type: "error", text: "CEP não encontrado." });
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setIsFetchingCep(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "cep") {
            const formatted = formatCep(value);
            setFormData((prev) => ({ ...prev, cep: formatted }));

            const clean = value.replace(/\D/g, "");
            if (clean.length === 8) {
                fetchAddressByCep(clean);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Manipula a seleção da nova imagem de perfil
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            // Se houver imagem selecionada, usamos FormData para enviar arquivo + campos
            if (selectedImage) {
                const data = new FormData();
                data.append("name", formData.name);
                data.append("phone", formData.phone);
                data.append("cep", formData.cep.replace(/\D/g, ""));
                data.append("city", formData.city);
                data.append("state", formData.state);
                data.append("neighborhood", formData.neighborhood);
                data.append("address", formData.address);
                data.append("number", formData.number);
                data.append("complement", formData.complement);
                data.append("image", selectedImage); // Nome do campo esperado pelo multer no backend

                await userService.updateUser(user.id, data);
            } else {
                // Apenas JSON padrão se não alterou a imagem
                const payload = {
                    ...formData,
                    cep: formData.cep.replace(/\D/g, "")
                };
                await userService.updateUser(user.id, payload);
            }

            // Atualiza os dados do usuário no contexto global
            if (typeof checkUser === 'function') {
                await checkUser();
            }

            setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
        } catch (error: any) {
            console.error("Erro ao atualizar perfil:", error);
            setMessage({ 
                type: "error", 
                text: error.response?.data?.error || "Erro ao atualizar perfil. Tente novamente." 
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-slate-800 pt-28">
                <div className="flex flex-col items-center gap-3">
                    <FaSpinner className="animate-spin text-3xl text-emerald-500" />
                    <p className="text-sm">A carregar perfil...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-slate-800 pt-28 px-4">
                <div className="text-center bg-slate-50 p-8 rounded-2xl border border-slate-300 max-w-md w-full shadow-md">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Acesso Restrito</h2>
                    <p className="text-slate-600 text-sm mb-6">Precisa de estar conectado para ver e editar o seu perfil.</p>
                    <a href="/login" className="inline-block bg-[#0F172A] text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition hover:bg-slate-800">
                        Fazer Entrar
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-800 pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* Cabeçalho do Perfil com Upload de Foto */}
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-6 mb-8 border border-slate-800">
                    <div className="relative group">
                        <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt={user?.name}
                                    className="h-24 w-24 rounded-full object-cover border-2 border-emerald-400 shadow-md transition group-hover:opacity-80"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-3xl font-bold text-emerald-400 transition group-hover:opacity-80">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <FaCamera className="text-white text-xl" />
                            </div>
                        </label>
                        <input 
                            id="avatar-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="text-center md:text-left">
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full inline-block mb-2">
                            {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                            {user?.name}
                        </h1>
                        <p className="text-slate-400 text-xs md:text-sm mt-1">
                            {user?.email}
                        </p>
                        <p className="text-[11px] text-emerald-400 mt-2">
                            Clique na sua foto para alterar a imagem de perfil.
                        </p>
                    </div>
                </div>

                {/* Mensagem de Feedback */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm text-center border ${
                        message.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                            : 'bg-red-50 border-red-300 text-red-600'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Formulário de Edição */}
                <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-300 p-6 md:p-8 rounded-2xl shadow-md flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-3">
                        Informações Pessoais e Endereço
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Nome */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaUser className="text-slate-400 text-xs" /> Nome Completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* E-mail */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaEnvelope className="text-slate-400 text-xs" /> E-mail
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="border border-slate-300 bg-slate-100 text-slate-500 p-3 rounded-xl text-sm outline-none cursor-not-allowed shadow-sm"
                            />
                        </div>

                        {/* Telefone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaPhone className="text-slate-400 text-xs" /> Telefone / WhatsApp
                            </label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* CEP */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FaMapMarkerAlt className="text-slate-400 text-xs" /> CEP
                                </span>
                                {isFetchingCep && (
                                    <span className="text-emerald-600 text-[10px] flex items-center gap-1 font-semibold">
                                        <FaSpinner className="animate-spin" /> Buscando endereço...
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="cep"
                                placeholder="00000-000"
                                maxLength={9}
                                value={formData.cep}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Cidade */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaCity className="text-slate-400 text-xs" /> Cidade
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Estado */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-slate-400 text-xs" /> Estado (UF)
                            </label>
                            <input
                                type="text"
                                name="state"
                                placeholder="Ex: MG"
                                maxLength={2}
                                value={formData.state}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm uppercase"
                            />
                        </div>

                        {/* Bairro */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaHome className="text-slate-400 text-xs" /> Bairro
                            </label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Rua / Endereço */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                <FaHome className="text-slate-400 text-xs" /> Endereço / Rua
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Número */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Número
                            </label>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                        {/* Complemento */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Complemento
                            </label>
                            <input
                                type="text"
                                name="complement"
                                placeholder="Apto, Bloco, Casa 2..."
                                value={formData.complement}
                                onChange={handleChange}
                                className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
                            />
                        </div>

                    </div>

                    {/* Botão de Salvar */}
                    <div className="pt-4 border-t border-slate-300 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl shadow-lg transition duration-200 flex items-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
                        >
                            {isSaving ? (
                                <>
                                    <FaSpinner className="animate-spin text-xs" /> A guardar...
                                </>
                            ) : (
                                <>
                                    <FaSave className="text-emerald-400 text-xs" /> Guardar Alterações
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}