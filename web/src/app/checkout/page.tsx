'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { FaShoppingBag, FaSpinner, FaCheckCircle } from "react-icons/fa";

// Importação dos componentes modulares do checkout
import ContactStep from "@/components/checkout/ContactStep";
import AddressStep from "@/components/checkout/AddressStep";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep from "@/components/checkout/PaymentStep";

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { cart, totalPrice } = useCart() as any;

    // Etapas: 1 = Contato, 2 = Endereço, 3 = Frete, 4 = Pagamento, 5 = Sucesso
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");

    // Estado unificado do formulário de contato e endereço
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cep: "",
        city: "",
        state: "",
        neighborhood: "",
        address: "",
        number: "",
        complement: ""
    });

    // Estados de Envio e Pagamento
    const [shippingMethod, setShippingMethod] = useState<string>("");
    const [shippingPrice, setShippingPrice] = useState<number>(0);
    const [completedOrderData, setCompletedOrderData] = useState<any>(null);

    // Preenche com os dados do utilizador logado assim que disponíveis
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                cpf: user.cpf || "",
                cep: user.cep || "",
                city: user.city || "",
                state: user.state || "",
                neighborhood: user.neighborhood || "",
                address: user.address || "",
                number: user.number || "",
                complement: user.complement || ""
            }));
        }
    }, [user]);

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

    if (cart.length === 0 && step !== 5) {
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
                        {step === 5 ? "Pedido concluído com sucesso!" : "Finalize a sua compra com segurança em poucas etapas."}
                    </p>

                    {step !== 5 && (
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>1</span>
                                Contato
                            </div>
                            <div className="w-8 h-0.5 bg-slate-200" />
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>2</span>
                                Endereço
                            </div>
                            <div className="w-8 h-0.5 bg-slate-200" />
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 3 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>3</span>
                                Frete
                            </div>
                            <div className="w-8 h-0.5 bg-slate-200" />
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border ${step >= 4 ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>4</span>
                                Pagamento
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl text-sm text-center border bg-red-50 border-red-300 text-red-600 shadow-sm">
                        {error}
                    </div>
                )}

                {/* ETAPA 1: Contato */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ContactStep 
                                formData={formData}
                                onChange={(e) => {
                                    const { name, value } = 'target' in e ? e.target : e;
                                    setFormData(prev => ({ ...prev, [name]: value }));
                                }}
                                onNext={() => {
                                    setError("");
                                    setStep(2);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </div>

                        {/* Resumo do Carrinho Lateral */}
                        <div className="bg-slate-50 border border-slate-300 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-4">
                            <h2 className="text-md font-bold text-slate-900 border-b border-slate-300 pb-3">Resumo da Compra</h2>
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                                {cart.map((item: any, idx: number) => (
                                    <div key={item.product?.id || idx} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-600 truncate max-w-[200px]">{item.quantity}x {item.product?.name}</span>
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
                    </div>
                )}

                {/* ETAPA 2: Endereço */}
                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <AddressStep 
                                formData={formData}
                                onChange={(e) => {
                                    const { name, value } = 'target' in e ? e.target : e;
                                    setFormData(prev => ({ ...prev, [name]: value }));
                                }}
                                onNext={() => {
                                    setError("");
                                    setStep(3);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onBack={() => setStep(1)}
                            />
                        </div>

                        <div className="bg-slate-50 border border-slate-300 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-4">
                            <h2 className="text-md font-bold text-slate-900 border-b border-slate-300 pb-3">Resumo da Compra</h2>
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                                {cart.map((item: any, idx: number) => (
                                    <div key={item.product?.id || idx} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-600 truncate max-w-[200px]">{item.quantity}x {item.product?.name}</span>
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
                    </div>
                )}

                {/* ETAPA 3: Frete (Melhor Envio) */}
                {step === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ShippingStep 
                                shippingMethod={shippingMethod}
                                setShippingMethod={setShippingMethod}
                                onSelectShippingPrice={(price) => setShippingPrice(price)}
                                formData={formData}
                                onNext={() => {
                                    setStep(4);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onBack={() => setStep(2)}
                            />
                        </div>

                        <div className="bg-slate-50 border border-slate-300 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-4">
                            <h2 className="text-md font-bold text-slate-900 border-b border-slate-300 pb-3">Resumo dos Valores</h2>
                            <div className="flex flex-col gap-2.5 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal dos produtos</span>
                                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Frete ({shippingMethod || 'Calculando...'})</span>
                                    <span>R$ {shippingPrice.toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-300">
                                    <span>Total Final</span>
                                    <span className="text-emerald-600 text-base">R$ {(totalPrice + shippingPrice).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ETAPA 4: Pagamento */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto">
                        <PaymentStep 
                            formData={formData}
                            shippingMethod={shippingMethod}
                            shippingPrice={shippingPrice}
                            onBack={() => setStep(3)}
                            onSuccessOrder={(orderResponse) => {
                                setCompletedOrderData(orderResponse);
                                setStep(5);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                )}

                {/* ETAPA 5: Sucesso */}
                {step === 5 && (
                    <div className="text-center bg-slate-50 border border-slate-300 p-10 rounded-2xl shadow-md max-w-xl mx-auto flex flex-col items-center gap-4">
                        <FaCheckCircle className="text-5xl text-emerald-600 animate-bounce" />
                        <h2 className="text-2xl font-bold text-slate-900">Pedido Realizado com Sucesso!</h2>
                        <p className="text-slate-600 text-sm">
                            Obrigado por comprar na <span className="font-semibold text-slate-900">AlziCrochê</span>. Enviamos os detalhes e a confirmação para o seu e-mail (<span className="text-slate-900 font-medium">{formData.email}</span>).
                        </p>
                        {completedOrderData?.id && (
                            <p className="text-xs text-slate-500 bg-slate-200/60 py-1 px-3 rounded-lg">
                                Código do Pedido: <span className="font-mono font-bold text-slate-700">#{completedOrderData.id}</span>
                            </p>
                        )}
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