'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { FaShoppingBag, FaTimes } from 'react-icons/fa';

export function CartModal() {
    const router = useRouter();
    const { cart, addToCart, decreaseQuantity, clearCart, totalPrice, isCartOpen, setIsCartOpen } = useCart();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

    if (!isCartOpen) return null;

    const handleClose = () => {
        setIsCartOpen(false);
    };

    return (
        <div className="fixed inset-0 z-99999 flex justify-end pointer-events-none">
            
            {/* Overlay escuro */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto transition-opacity"
                onClick={handleClose}
            />

            {/* Conteúdo Lateral do Carrinho */}
            <div className="relative w-screen max-w-md bg-white border-l border-slate-200 text-slate-800 shadow-2xl flex flex-col justify-between h-full pointer-events-auto z-10">
                
                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-[#0F172A] text-white">
                    <div className="flex items-center gap-2.5">
                        <FaShoppingBag className="h-5 w-5 text-emerald-400" />
                        <h2 className="text-lg font-bold tracking-tight">O seu Carrinho</h2>
                    </div>

                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        title="Fechar carrinho"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-100">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 font-medium text-sm">
                            O seu carrinho está vazio.
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-300 shadow-md">
                                {item.product.image_url ? (
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                                        <img
                                            src={item.product.image_url.startsWith('http') ? item.product.image_url : `${API_URL}${item.product.image_url}`}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                        Sem foto
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate text-slate-900">{item.product.name}</h4>
                                    <p className="text-xs text-slate-700 font-extrabold mt-1">
                                        R$ {Number(item.product.price).toFixed(2).replace('.', ',')}
                                    </p>
                                </div>

                                {/* Controles de Quantidade */}
                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.product.id !== undefined) {
                                                decreaseQuantity(item.product.id);
                                            }
                                        }}
                                        className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition cursor-pointer font-bold shadow-xs"
                                        title="Remover 1 unidade"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs font-bold w-5 text-center text-slate-900">{item.quantity}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item.product);
                                        }}
                                        className="h-7 w-7 rounded-lg bg-[#0F172A] flex items-center justify-center text-white hover:bg-slate-800 transition shadow-xs cursor-pointer font-bold"
                                        title="Adicionar mais 1"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Rodapé com Totais e Ações */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-slate-200 bg-white space-y-4 shadow-lg">
                        <div className="flex items-center justify-between text-base font-bold">
                            <span className="text-slate-500 text-sm">Total do Pedido:</span>
                            <span className="text-slate-900 text-xl font-extrabold">
                                R$ {totalPrice.toFixed(2).replace('.', ',')}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={clearCart}
                                className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={() => {
                                    handleClose();
                                    router.push('/checkout');
                                }}
                                className="flex-2 rounded-xl bg-[#0F172A] py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md cursor-pointer"
                            >
                                Finalizar Pedido
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}