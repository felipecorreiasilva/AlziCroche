'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  FaShieldAlt, 
  FaLock, 
  FaTruck, 
  FaInstagram, 
  FaWhatsapp, 
  FaCreditCard 
} from "react-icons/fa";
import { SiPix } from "react-icons/si";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#0F172A] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-8">
        
        {/* Banner de Garantia e Compra Segura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <FaShieldAlt className="text-3xl text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Compra 100% Segura</h4>
              <p className="text-xs text-slate-400">Seus dados totalmente protegidos</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <FaLock className="text-3xl text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Criptografia SSL</h4>
              <p className="text-xs text-slate-400">Ambiente seguro com certificado</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <FaTruck className="text-3xl text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Entrega Garantida</h4>
              <p className="text-xs text-slate-400">Enviamos para todo o Brasil</p>
            </div>
          </div>
        </div>

        {/* Seções Principais do Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12 border-b border-slate-800">
          
          {/* Coluna 1: Marca & Apresentação */}
          <div className="space-y-4">
            <img className="h-20 w-auto" src="/logo.png" alt="AlziCrochê Logo" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Peças artesanais exclusivas tecidas à mão com dedicação e carinho para transformar o seu estilo e o seu lar.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="bg-slate-800 p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-pink-600 transition"
                aria-label="Instagram"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a 
                href="https://wa.me/5575988158166" 
                target="_blank" 
                rel="noreferrer"
                className="bg-slate-800 p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-emerald-600 transition"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-lg" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Navegação</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">Início</Link>
              </li>
              <li>
                <Link href="#produtos" className="hover:text-white transition">Produtos Exclusivos</Link>
              </li>
              <li>
                <Link href="#sobre" className="hover:text-white transition">Sobre a AlziCrochê</Link>
              </li>
              <li>
                <Link href="#contato" className="hover:text-white transition">Fale Conosco</Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento e Suporte */}
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Atendimento</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Uberlândia - MG</li>
              <li>WhatsApp: (75) 98815-8166</li>
              <li>E-mail: contato@alzicroche.com</li>
              <li className="pt-2 text-slate-500">Horário: Seg a Sex das 08h às 18h</li>
            </ul>
          </div>

          {/* Coluna 4: Meios de Pagamento e Selo */}
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Formas de Pagamento</h3>
            <div className="flex flex-wrap gap-2 text-slate-400 mb-6">
              <span className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-emerald-400 font-semibold">
                <SiPix className="text-sm" /> Pix
              </span>
              <span className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg text-xs border border-slate-700 text-slate-300">
                <FaCreditCard className="text-sm" /> Cartão de Crédito
              </span>
            </div>

            <h3 className="font-semibold text-white text-xs tracking-wider uppercase mb-2">Segurança</h3>
            <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs text-slate-300">
              <FaLock className="text-emerald-400" />
              <span>Certificado SSL 256-bit</span>
            </div>
          </div>

        </div>

        {/* Rodapé Final de Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center md:text-left">
          <p>© {currentYear} AlziCrochê. Todos os direitos reservados.</p>
          <p className="text-slate-600">Feito com carinho & artesanalmente.</p>
        </div>

      </div>
    </footer>
  );
}