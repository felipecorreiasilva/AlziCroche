'use client';

import React, { useState, useEffect } from "react";
import { FaTruck, FaArrowRight, FaArrowLeft, FaSpinner, FaBox } from "react-icons/fa";
import { CheckoutFormData } from "@/types/checkout";
import { useCart } from "@/context/CartContext";
import api from "@/service/api";

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
    onSelectShippingPrice: (price: number) => void;
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

    useEffect(() => {
        const fetchShippingOptions = async () => {
            setIsLoading(true);
            setError("");

            try {
                const cleanCep = formData.cep ? formData.cep.replace(/\D/g, "") : "";

                if (!cleanCep || cleanCep.length !== 8) {
                    setError("CEP inválido para cálculo de frete. Volte à etapa anterior.");
                    setIsLoading(false);
                    return;
                }

                // Ajustado para 'postal_code_destination' conforme esperado pelo backend
                const response = await api.post("/shipping/calculate", {
                    postal_code_destination: cleanCep,
                    products: cart.map((item: any) => ({
                        id: item.product.id,
                        quantity: item.quantity,
                        price: item.product.price,
                        weight: item.product.weight || 0.3,
                        width: item.product.width || 15,
                        height: item.product.height || 10,
                        length: item.product.length || 20,
                        insurance_value: Number(item.product.price) || 0,
                    }))
                });

                setShippingOptions(response.data);

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
                <FaTruck className="text-emerald-600" /> Escolha a Opção de Envio
            </h2>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <FaSpinner className="animate-spin text-3xl text-emerald-600" />
                    <p className="text-xs text-slate-600">Calculando as opções de frete disponíveis...</p>
                </div>
            ) : shippingOptions.length > 0 ? (
                /* Grid de Cards para escolha de Envio (PAC / SEDEX) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shippingOptions.map((option) => {
                        const price = Number(option.custom_price || option.price);
                        const isSelected = shippingMethod === option.name;

                        return (
                            <div 
                                key={option.id}
                                onClick={() => handleSelectOption(option)}
                                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 bg-white ${
                                    isSelected 
                                        ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md bg-emerald-50/20' 
                                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                                }`}
                            >
                                {/* Cabeçalho do Card com Logo / Nome e Radio visual */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 p-1">
                                            {option.company?.picture ? (
                                                <img src={option.company.picture} alt={option.company.name} className="h-full object-contain" />
                                            ) : (
                                                <FaBox className="text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{option.company?.name || 'Correios'}</span>
                                            <h3 className="font-bold text-slate-900 text-base">{option.name}</h3>
                                        </div>
                                    </div>
                                    <input 
                                        type="radio" 
                                        name="shipping" 
                                        checked={isSelected} 
                                        onChange={() => handleSelectOption(option)} 
                                        className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-1 cursor-pointer"
                                    />
                                </div>

                                {/* Corpo do Card com Prazo e Preço */}
                                <div className="flex items-end justify-between border-t border-slate-100 pt-4 mt-2">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Prazo estimado</span>
                                        <span className="font-semibold text-slate-800 text-sm">
                                            Até {option.delivery_time} {option.delivery_time === 1 ? 'dia útil' : 'dias úteis'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-500 block">Valor</span>
                                        <span className="font-extrabold text-emerald-700 text-lg">
                                            R$ {price.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </div>
                            </div>
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