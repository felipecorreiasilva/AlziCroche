'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHome, FaCity, FaTruck, FaShoppingBag, FaArrowRight, FaArrowLeft, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { cart, totalItems, totalPrice, clearCart } = useCart();

    // Etapas: 1 = Endereço e Contato, 2 = Frete (PAC / SEDEX), 3 = Sucesso/Conclusão
    const [step, setStep] = useState(1);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Estado do formulário de entrega
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

    // Opções de Frete
    const [shippingMethod, setShippingMethod] = useState<"pac" | "sedex">("pac");

    // Preenche com os dados do utilizador logado assim que estiverem disponíveis
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
        }
    }, [user]);

    // Máscara e formatação de CEP (00000-000)
    const formatCep = (value: string) => {
        if (!value) return "";
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 8) {
            return numbers.replace(/(\d{5})(\d{1,3})?/, "$1-$2").replace(/-$/, "");
        }
        return numbers.slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2");
    };

    // Consulta ViaCEP
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
            }
        } catch (err) {
            console.error("Erro ao buscar CEP:", err);
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
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Avançar da Etapa 1 para a Etapa 2
    const handleNextToShipping = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.phone || !formData.cep || !formData.address || !formData.number || !formData.city || !formData.state) {
            setError("Por favor, preencha todos os campos obrigatórios de contato e endereço.");
            return;
        }

        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cálculo do frete
    const shippingCost = shippingMethod === "sedex" ? 35.00 : 18.50;
    const finalTotal = totalPrice + shippingCost;

    // Finalizar o pedido
    const handleFinishOrder = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            clearCart();
            setStep(3);
        } catch (err) {
            console.error("Erro ao finalizar pedido:", err);
            setError("Ocorreu um erro ao processar o seu pedido. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-slate-800 pt-28">
                <div className="flex flex-col items-center gap-3">
                    <FaSpinner className="animate-spin text-3xl text-emerald-500" />
                    <p className="text-sm">A carregar checkout...</p>
                </div>
            </div>
        );
    }

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-slate-800 pt-32 px-4">
                <div className="text-center bg-slate-50 p-8 rounded-2xl border border-slate-300 max-w-md w-full shadow-md">
                    <FaShoppingBag className="mx-auto text-4xl text-slate-400 mb-3" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">O seu carrinho está vazio</h2>
                    <p className="text-slate-600 text-sm mb-6">Adicione algumas peças em crochê antes de avançar para o checkout.</p>
                    <button 
                        onClick={() => router.push('/products')}
                        className="inline-block bg-[#0F172A] text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition hover:bg-slate-800 cursor-pointer"
                    >
                        Ver Produtos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-800 pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Cabeçalho e Indicador de Etapas */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                        Checkout AlziCrochê
                    </h1>
                    <p className="text-slate-600 text-sm">
                        {step === 3 ? "Pedido concluído com sucesso!" : "Finalize a sua compra com segurança em poucas etapas."}
                    </p>

                    {step !== 3 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>1</span>
                                Endereço e Contato
                            </div>
                            <div className="w-12 h-0.5 bg-slate-200" />
                            <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>2</span>
                                Forma de Envio
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl text-sm text-center border bg-red-50 border-red-300 text-red-600 shadow-sm">
                        {error}
                    </div>
                )}

                {/* ETAPA 1: Dados de Contato e Endereço */}
                {step === 1 && (
                    <form onSubmit={handleNextToShipping} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <div className="lg:col-span-2 bg-slate-50 border border-slate-300 p-6 md:p-8 rounded-2xl shadow-md flex flex-col gap-6">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-emerald-600" /> Endereço de Entrega e Contato
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="(00) 00000-0000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600 flex items-center justify-between">
                                        CEP
                                        {isFetchingCep && <span className="text-emerald-600 text-[10px] flex items-center gap-1"><FaSpinner className="animate-spin" /> Buscando...</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name="cep"
                                        placeholder="00000-000"
                                        maxLength={9}
                                        value={formData.cep}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Endereço / Rua</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Número</label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Complemento (Opcional)</label>
                                    <input
                                        type="text"
                                        name="complement"
                                        placeholder="Apto, Bloco..."
                                        value={formData.complement}
                                        onChange={handleChange}
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Bairro</label>
                                    <input
                                        type="text"
                                        name="neighborhood"
                                        value={formData.neighborhood}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold uppercase text-slate-600">Estado (UF)</label>
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="Ex: MG"
                                        maxLength={2}
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm uppercase"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-300 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-sm"
                                >
                                    Continuar para o Frete <FaArrowRight className="text-xs" />
                                </button>
                            </div>
                        </div>

                        {/* Resumo do Carrinho Lateral */}
                        <div className="bg-slate-50 border border-slate-300 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-4">
                            <h2 className="text-md font-bold text-slate-900 border-b border-slate-300 pb-3">Resumo da Compra</h2>
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                                {cart.map((item, idx) => (
                                    <div key={item.product?.id || idx} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-600 truncate max-w-[140px]">{item.quantity}x {item.product?.name}</span>
                                        <span className="font-semibold text-slate-900">R$ {(Number(item.product?.price || 0) * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-300 pt-3 flex flex-col gap-2">
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span>Subtotal</span>
                                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                                    <span>Total</span>
                                    <span className="text-emerald-600">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* ETAPA 2: Formas de Envio */}
                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-slate-50 border border-slate-300 p-6 md:p-8 rounded-2xl shadow-md flex flex-col gap-6">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
                                <FaTruck className="text-emerald-600" /> Escolha a Forma de Envio
                            </h2>

                            <div className="flex flex-col gap-4">
                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${shippingMethod === 'pac' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="radio" 
                                            name="shipping" 
                                            checked={shippingMethod === 'pac'} 
                                            onChange={() => setShippingMethod('pac')} 
                                            className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">Correios PAC</p>
                                            <p className="text-xs text-slate-500">Entrega estimada em 6 a 10 dias úteis</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-900 text-sm">R$ 18,50</span>
                                </label>

                                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${shippingMethod === 'sedex' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="radio" 
                                            name="shipping" 
                                            checked={shippingMethod === 'sedex'} 
                                            onChange={() => setShippingMethod('sedex')} 
                                            className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm">Correios SEDEX (Expresso)</p>
                                            <p className="text-xs text-slate-500">Entrega estimada em 2 a 4 dias úteis</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-900 text-sm">R$ 35,00</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-300 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-slate-600 hover:text-slate-900 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <FaArrowLeft /> Voltar para Endereço
                                </button>

                                <button
                                    type="button"
                                    onClick={handleFinishOrder}
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin text-xs" /> Processando...
                                        </>
                                    ) : (
                                        <>
                                            Concluir Pedido <FaCheckCircle className="text-xs" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-300 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-4">
                            <h2 className="text-md font-bold text-slate-900 border-b border-slate-300 pb-3">Resumo dos Valores</h2>
                            <div className="flex flex-col gap-2.5 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal dos produtos</span>
                                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Frete ({shippingMethod.toUpperCase()})</span>
                                    <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-300">
                                    <span>Total Final</span>
                                    <span className="text-emerald-600 text-base">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ETAPA 3: Sucesso */}
                {step === 3 && (
                    <div className="text-center bg-slate-50 border border-slate-300 p-10 rounded-2xl shadow-md max-w-xl mx-auto flex flex-col items-center gap-4">
                        <FaCheckCircle className="text-5xl text-emerald-600 animate-bounce" />
                        <h2 className="text-2xl font-bold text-slate-900">Pedido Realizado com Sucesso!</h2>
                        <p className="text-slate-600 text-sm">
                            Obrigado por comprar na <span className="font-semibold text-slate-900">AlziCrochê</span>. Enviamos os detalhes e a confirmação para o seu e-mail (<span className="text-slate-900 font-medium">{formData.email}</span>).
                        </p>
                        <div className="pt-4 w-full">
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition text-sm cursor-pointer"
                            >
                                Voltar à Página Inicial
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}