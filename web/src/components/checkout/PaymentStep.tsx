'use client';

import React, { useState } from "react";
import { FaCreditCard, FaQrcode, FaArrowLeft, FaCheckCircle, FaSpinner, FaLock } from "react-icons/fa";
import { CheckoutFormData } from "@/types/checkout";
import { useCart } from "@/context/CartContext";
import { EfiBankService } from "@/service/efiBankService";

interface PaymentStepProps {
    formData: CheckoutFormData;
    shippingMethod: string;
    shippingPrice: number;
    onBack: () => void;
    onSuccessOrder: (orderData: any) => void;
}

export default function PaymentStep({ 
    formData, 
    shippingMethod, 
    shippingPrice, 
    onBack, 
    onSuccessOrder 
}: PaymentStepProps) {
    const { cart, clearCart } = useCart() as any;
    const [paymentMethod, setPaymentMethod] = useState<string>("pix"); // 'pix', 'credit_card', 'debit_card'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Campos do formulário de cartão
    const [cardData, setCardData] = useState({
        number: "",
        name: "",
        expiry: "",
        cvv: ""
    });

    const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    // Cálculo do subtotal dos produtos do carrinho
    const subtotal = cart.reduce((acc: number, item: any) => {
        return acc + (Number(item.product.price) * Number(item.quantity));
    }, 0);

    const totalOrder = subtotal + shippingPrice;

    const handleFinishOrder = async () => {
        setIsLoading(true);
        setError("");

        // Validação básica caso seja cartão
        if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
            if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
                setError("Por favor, preencha todos os dados do cartão.");
                setIsLoading(false);
                return;
            }
        }

        try {
            const orderPayload = {
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    cpf: formData.cpf,
                },
                address: {
                    cep: formData.cep,
                    address: formData.address,
                    number: formData.number,
                    complement: formData.complement || "",
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                },
                shipping: {
                    service: shippingMethod || "PAC",
                    cost: shippingPrice,
                },
                payment: {
                    method: paymentMethod as 'pix' | 'credit_card' | 'debit_card', // <-- Correção do tipo aqui
                    card_details: (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') ? {
                        number: cardData.number,
                        name: cardData.name,
                        expiry: cardData.expiry,
                        cvv: cardData.cvv
                    } : undefined
                },
                items: cart.map((item: any) => ({
                    product_id: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                subtotal: subtotal,
                total: totalOrder,
            };

            // Envia para a rota unificada do backend (/efi/pay) que processa e grava na tabela orders
            const response = await EfiBankService.processPayment(orderPayload);

            clearCart();
            onSuccessOrder(response);

        } catch (err: any) {
            console.error("Erro ao processar pagamento:", err);
            setError(err.error || err.response?.data?.error || "Ocorreu um erro ao processar o seu pagamento. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-300 p-6 md:p-8 rounded-2xl shadow-md flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
                <FaCreditCard className="text-emerald-600" /> Forma de Pagamento
            </h2>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
                    {error}
                </div>
            )}

            {/* Opções de Pagamento (Apenas Pix e Cartão) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pix */}
                <label 
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 cursor-pointer transition-all gap-3 bg-white ${
                        paymentMethod === 'pix' ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="pix" 
                        checked={paymentMethod === 'pix'} 
                        onChange={() => setPaymentMethod('pix')} 
                        className="sr-only"
                    />
                    <FaQrcode className={`text-3xl ${paymentMethod === 'pix' ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span className="font-bold text-slate-900 text-sm">Pix (Aprovação imediata)</span>
                </label>

                {/* Cartão (Geral) */}
                <label 
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 cursor-pointer transition-all gap-3 bg-white ${
                        (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="credit_card" 
                        checked={paymentMethod === 'credit_card' || paymentMethod === 'debit_card'} 
                        onChange={() => setPaymentMethod('credit_card')} 
                        className="sr-only"
                    />
                    <FaCreditCard className={`text-3xl ${(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span className="font-bold text-slate-900 text-sm">Cartão</span>
                </label>
            </div>

            {/* Sub-abas de Crédito e Débito com bordas bem definidas */}
            {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <div className="bg-white p-5 rounded-xl border border-slate-300 flex flex-col gap-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('credit_card')}
                            className={`py-2.5 text-xs font-bold rounded-lg transition cursor-pointer border ${
                                paymentMethod === 'credit_card' 
                                    ? 'bg-white text-emerald-700 border-emerald-600 shadow-sm ring-1 ring-emerald-600/20' 
                                    : 'bg-transparent text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900'
                            }`}
                        >
                            Crédito
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('debit_card')}
                            className={`py-2.5 text-xs font-bold rounded-lg transition cursor-pointer border ${
                                paymentMethod === 'debit_card' 
                                    ? 'bg-white text-emerald-700 border-emerald-600 shadow-sm ring-1 ring-emerald-600/20' 
                                    : 'bg-transparent text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900'
                            }`}
                        >
                            Débito
                        </button>
                    </div>

                    {/* Formulário do Cartão */}
                    <div className="flex flex-col gap-3 pt-1">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold uppercase text-slate-600">Número do Cartão</label>
                            <input
                                type="text"
                                name="number"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                value={cardData.number}
                                onChange={handleCardInputChange}
                                className="border border-slate-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 bg-slate-50"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold uppercase text-slate-600">Nome Impresso no Cartão</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Como está no cartão"
                                value={cardData.name}
                                onChange={handleCardInputChange}
                                className="border border-slate-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 bg-slate-50 uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold uppercase text-slate-600">Validade (MM/AA)</label>
                                <input
                                    type="text"
                                    name="expiry"
                                    placeholder="MM/AA"
                                    maxLength={5}
                                    value={cardData.expiry}
                                    onChange={handleCardInputChange}
                                    className="border border-slate-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 bg-slate-50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold uppercase text-slate-600 flex items-center gap-1">
                                    CVV <FaLock className="text-[10px] text-slate-400" />
                                </label>
                                <input
                                    type="password"
                                    name="cvv"
                                    placeholder="123"
                                    maxLength={4}
                                    value={cardData.cvv}
                                    onChange={handleCardInputChange}
                                    className="border border-slate-300 p-2.5 rounded-xl text-xs outline-none focus:border-emerald-500 bg-slate-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumo Financeiro do Pedido */}
            <div className="bg-white p-5 rounded-xl border border-slate-300 flex flex-col gap-3 text-sm">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Resumo dos Valores</h3>
                
                <div className="flex justify-between text-slate-600 text-xs">
                    <span>Subtotal dos produtos:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="flex justify-between text-slate-600 text-xs">
                    <span>Frete ({shippingMethod}):</span>
                    <span>R$ {shippingPrice.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-3 text-base">
                    <span>Total a pagar:</span>
                    <span className="text-emerald-700">R$ {totalOrder.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>

            {/* Ações de Navegação */}
            <div className="pt-4 border-t border-slate-300 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="text-slate-600 hover:text-slate-900 font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                    <FaArrowLeft /> Voltar
                </button>

                <button
                    type="button"
                    onClick={handleFinishOrder}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-sm disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <FaSpinner className="animate-spin text-xs" /> Processando Pagamento...
                        </>
                    ) : (
                        <>
                            <FaCheckCircle className="text-xs" /> Finalizar Pedido
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}