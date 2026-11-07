'use client'

import { useState } from "react";
import Link from "next/link";
import { BsCart } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="z-50 fixed w-full flex justify-between items-center py-4 px-6 md:px-16 bg-[#0F172A] text-white border-b border-slate-800">
      {/* Logo */}
      <Link href="/">
        <img className="h-12 md:h-16 w-auto object-contain" src="/logo.png" alt="AlziCrochê" />
      </Link>

      {/* Menu Desktop */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-8">
          <li><Link href="/" className="hover:text-pink-400 transition-colors">Início</Link></li>
          <li><Link href="/products" className="hover:text-pink-400 transition-colors">Produtos</Link></li>
          <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contato</Link></li>
          <li>
            <Link href="/cart" className="hover:text-pink-400 transition-colors">
              <BsCart className="h-5 w-5" />
            </Link>
          </li>
          <li>
            <div className="flex items-center gap-x-2">
              <CgProfile className="h-6 w-6 text-slate-300" />
              <div className="flex flex-col text-[11px] leading-tight">
                <span className="text-slate-400">Bem-vindo(a)</span>
                <div>
                  <Link href="/login" className="font-semibold hover:underline">Entrar</Link>
                  <span className="mx-1 text-slate-400">|</span>
                  <Link href="/register" className="font-semibold hover:underline">Criar Conta</Link>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      {/* Botão do Menu Mobile (Hambúrguer) */}
      <div className="flex items-center gap-4 md:hidden">
        <Link href="/cart" className="hover:text-pink-400 transition-colors">
          <BsCart className="h-6 w-6" />
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-200 hover:text-white focus:outline-none"
          aria-label="Abrir Menu"
        >
          {isOpen ? <HiX className="h-7 w-7" /> : <HiMenu className="h-7 w-7" />}
        </button>
      </div>

      {/* Menu Dropdown Mobile */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0F172A] border-b border-slate-800 py-6 px-8 flex flex-col gap-4 shadow-2xl md:hidden transition-all">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-medium hover:text-pink-400 transition"
          >
            Início
          </Link>
          <Link 
            href="/products" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-medium hover:text-pink-400 transition"
          >
            Produtos
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-medium hover:text-pink-400 transition"
          >
            Contato
          </Link>
          
          <hr className="border-slate-800 my-2" />

          {/* Perfil no Mobile */}
          <div className="flex items-center gap-3 pt-2">
            <CgProfile className="h-8 w-8 text-slate-300" />
            <div className="flex flex-col text-xs">
              <span className="text-slate-400">Bem-vindo(a)</span>
              <div>
                <Link href="/login" onClick={() => setIsOpen(false)} className="font-semibold hover:underline">Entrar</Link>
                <span className="mx-1 text-slate-400">|</span>
                <Link href="/register" onClick={() => setIsOpen(false)} className="font-semibold hover:underline">Criar Conta</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}