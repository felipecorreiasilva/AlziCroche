'use client';

import React, { useState } from "react";
import { FaMapMarkerAlt, FaArrowRight, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { CheckoutFormData } from "@/types/checkout";

interface AddressStepProps {
    formData: CheckoutFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function AddressStep({ formData, onChange, onNext, onBack }: AddressStepProps) {
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    // Função de máscara visual para o CEP (00000-000) no input
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
                const updates = {
                    address: data.logradouro || "",
                    neighborhood: data.bairro || "",
                    city: data.localidade || "",
                    state: data.uf || "",
                };

                // Atualiza cada campo automaticamente
                Object.entries(updates).forEach(([name, value]) => {
                    onChange({
                        target: { name, value }
                    });
                });
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setIsFetchingCep(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "cep") {
            const formattedCep = formatCep(value);
            
            // Atualiza o input com a máscara visual
            onChange({
                target: {
                    name: "cep",
                    value: formattedCep
                }
            });

            // Se atingir 8 números, dispara o ViaCEP
            const cleanCep = value.replace(/\D/g, "");
            if (cleanCep.length === 8) {
                fetchAddressByCep(cleanCep);
            }
        } else {
            onChange(e);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-300 p-6 md:p-8 rounded-2xl shadow-md flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-600" /> Endereço de Entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600 flex items-center justify-between">
                        CEP
                        {isFetchingCep && (
                            <span className="text-emerald-600 text-[10px] flex items-center gap-1 font-semibold">
                                <FaSpinner className="animate-spin" /> Buscando...
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        name="cep"
                        placeholder="00000-000"
                        maxLength={9}
                        value={formData.cep || ""}
                        onChange={handleInputChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-600">Endereço / Rua</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={onChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Número</label>
                    <input
                        type="text"
                        name="number"
                        value={formData.number || ""}
                        onChange={onChange}
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
                        value={formData.complement || ""}
                        onChange={onChange}
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Bairro</label>
                    <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood || ""}
                        onChange={onChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600">Cidade</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city || ""}
                        onChange={onChange}
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
                        value={formData.state || ""}
                        onChange={onChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm uppercase"
                    />
                </div>
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
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-sm"
                >
                    Continuar para o Envio <FaArrowRight className="text-xs" />
                </button>
            </div>
        </form>
    );
}