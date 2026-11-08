'use client';

import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaArrowRight } from "react-icons/fa";
import { CheckoutFormData } from "@/types/checkout"; // Ajuste o caminho se necessário

interface ContactStepProps {
    formData: CheckoutFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => void;
    onNext: () => void;
}

export default function ContactStep({ formData, onChange, onNext }: ContactStepProps) {

    // Função de máscara visual para o CPF (000.000.000-00)
    const formatCpf = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        return numbers
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "cpf") {
            const formattedCpf = formatCpf(value);
            // Cria um evento sintético para atualizar o estado com o valor formatado no input
            onChange({
                target: {
                    name: "cpf",
                    value: formattedCpf
                }
            });
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
                <FaUser className="text-emerald-600" /> Informações de Contato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-600 flex items-center gap-1.5">
                        <FaUser className="text-slate-400 text-xs" /> Nome Completo
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={onChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600 flex items-center gap-1.5">
                        <FaIdCard className="text-slate-400 text-xs" /> CPF
                    </label>
                    <input
                        type="text"
                        name="cpf"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        value={formData.cpf || ""}
                        onChange={handleInputChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-600 flex items-center gap-1.5">
                        <FaPhone className="text-slate-400 text-xs" /> Telefone / WhatsApp
                    </label>
                    <input
                        type="text"
                        name="phone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone || ""}
                        onChange={onChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-600 flex items-center gap-1.5">
                        <FaEnvelope className="text-slate-400 text-xs" /> E-mail
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={onChange}
                        required
                        className="border border-slate-300 bg-white p-3 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-300 flex justify-end">
                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer text-sm"
                >
                    Continuar para o Endereço <FaArrowRight className="text-xs" />
                </button>
            </div>
        </form>
    );
}