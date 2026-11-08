'use client';

import React, { useState, useEffect } from "react";
import { FaTruck, FaArrowRight, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { CheckoutFormData } from "@/types/checkout";
import { useCart } from "@/context/CartContext";
import api from "@/service/api"; // O seu axios configurado com o token

interface ShippingOption {
    id: number;
    name: string;
    company: {
        name: string;
        picture: string;
    };
    price: string;
    custom_price: string;
    discount: string;
    delivery_time: number; // Prazo em dias úteis
}

interface ShippingStepProps {
    shippingMethod: string;
    setShippingMethod: (method: string) => void;
    onNext: () => void;
    onBack: () => void;
    formData: CheckoutFormData;
    onSelectShippingPrice: (price: number) => void; // Para atualizar o valor total no componente pai
}

export default function ShippingStep({ 
    shippingMethod, 
    setShippingMethod, 
    onNext, 
    onBack, 
    formData, 
    onSelectShippingPrice 
}: ShippingStepProps) {
    const { cart } = useCart() as any;
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Buscar cotação no Melhor Envio assim que o componente for montado
    useEffect(() => {
        const fetchShippingOptions = async () => {
            setIsLoading(true);
            setError("");

            try {
                // Limpa o CEP para enviar apenas números
                const cleanCep = formData.cep ? formData.cep.replace(/\D/g, "") : "";

                if (!cleanCep || cleanCep.length !== 8) {
                    setError("CEP inválido para cálculo de frete. Volte à etapa anterior.");
                    setIsLoading(false);
                    return;
                }

                // Chamada para a sua API backend que consome o Melhor Envio
                const response = await api.post("/shipping/calculate", {
                    postal_code: cleanCep,
                    products: cart.map((item: any) => ({
                        id: item.product.id,
                        quantity: item.quantity,
                        price: item.product.price,
                        // Se tiver peso/dimensões cadastradas no produto, envie aqui também:
                        weight: item.product.weight || 0.3,
                        width: item.product.width || 15,
                        height: item.product.height || 10,
                        length: item.product.length || 20,
                    }))
                });

                setShippingOptions(response.data);

                // Se houver opções e nenhuma estiver selecionada, seleciona a primeira por padrão
                if (response.data && response.data.length > 0 && !shippingMethod) {
                    const firstOption = response.data[0];
                    setShippingMethod(firstOption.name);
                    onSelectShippingPrice(Number(firstOption.custom_price || firstOption.price));
                }
            } catch (err: any) {
                console.error("Erro ao calcular frete com Melhor Envio:", err);
                setError(err.response?.data?.error || "Não foi possível calcular o frete no momento. Tente novamente.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchShippingOptions();
    }, []);

    const handleSelectOption = (option: ShippingOption) => {
        const price = Number(option.custom_price || option.price);
        setShippingMethod(option.name);
        onSelectShippingPrice(price);
    };

    return (
        <div className="bg-slate-50 border border-slate-300 p-6 md:p-8 rounded-2xl shadow-md flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
                <FaTruck className="text-emerald-600" /> Opções de Envio (Melhor Envio)
            </h2>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <FaSpinner className="animate-spin text-3xl text-emerald-600" />
                    <p className="text-xs text-slate-600">Calculando o melhor frete para o seu endereço...</p>
                </div>
            ) : shippingOptions.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {shippingOptions.map((option) => {
                        const price = Number(option.custom_price || option.price);
                        const isSelected = shippingMethod === option.name;

                        return (
                            <label 
                                key={option.id} 
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                    isSelected ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="shipping" 
                                        checked={isSelected} 
                                        onChange={() => handleSelectOption(option)} 
                                        className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {option.company?.picture && (
                                                <img src={option.company.picture} alt={option.company.name} className="h-5 object-contain" />
                                            )}
                                            <p className="font-semibold text-slate-900 text-sm">{option.name}</p>
                                        </div>
                                        <p className="text-xs text-slate-500">Entrega estimada em até {option.delivery_time} dias úteis</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900 text-sm">
                                    R$ {price.toFixed(2).replace('.', ',')}
                                </span>
                            </label>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                    Nenhuma transportadora disponível para o CEP informado.
                </div>
            )}

            {/* Resumo do Endereço de Entrega */}
            <div className="bg-white p-4 rounded-xl border border-slate-300 text-xs text-slate-600 flex flex-col gap-1">
                <span className="font-semibold text-slate-800">Enviar para:</span>
                <p>{formData.address}, {formData.number} {formData.complement ? `- ${formData.complement}` : ''}</p>
                <p>{formData.neighborhood} - {formData.city}/{formData.state} | CEP: {formData.cep}</p>
            </div>

            <div className="pt-4 border-t border-slate-300 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-slate-600 hover:text-slate-900 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                >
                    <FaArrowLeft /> Voltar
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading || shippingOptions.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                >
                    Continuar para o Pagamento <FaArrowRight className="text-xs" />
                </button>
            </div>
        </div>
    );
}