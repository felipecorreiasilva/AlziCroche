'use client'

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5575988158166?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20as%20peças%20da%20AlziCrochê."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contato via WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
    >
      <FaWhatsapp className="h-7 w-7" />
      
      {/* Tooltip de texto que aparece ao passar o mouse */}
      <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-slate-800">
        Fale conosco no WhatsApp
      </span>
    </a>
  );
}