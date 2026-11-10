'use client';

import { useState } from "react";
import Link from "next/link";
import { BsCart } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { HiMenu, HiX } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isLoading, logout } = useAuth() as any;

  // Normaliza a propriedade da imagem do usuário para evitar falhas de nomenclatura
  const userImage = user?.image_url || user?.avatar || user?.avatar_url || user?.photo;
  const fullImageUrl = userImage 
    ? (userImage.startsWith('http') ? userImage : `${process.env.NEXT_PUBLIC_API_URL}${userImage}`)
    : null;

  return (
    <header className="z-50 fixed w-full flex justify-between items-center py-4 px-6 md:px-16 bg-[#0F172A] text-white border-b border-slate-800">
      {/* Logo */}
      <Link href="/">
        <img className="h-12 md:h-16 w-auto object-contain" src="/logo.png" alt="AlziCrochê" />
      </Link>

      {/* Menu Desktop */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-8">
          <li><Link href="/" className="hover:text-emerald-400 transition-colors">Início</Link></li>
          <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Produtos</Link></li>
          <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contato</Link></li>
          <li>
            {/* Botão para abrir o CartModal no Desktop */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-emerald-400 transition-colors flex items-center cursor-pointer"
              title="Abrir carrinho"
            >
              <BsCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-emerald-400 text-slate-950 font-bold text-[10px] h-4 w-4 rounded-full flex items-center justify-center shadow-md">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </li>
          <li>
            {isLoading ? (
              <div className="h-8 w-28 bg-slate-800/80 animate-pulse rounded-lg" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="Ver perfil"
                >
                  {fullImageUrl ? (
                    <img
                      src={fullImageUrl}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover border border-slate-700 shadow-inner"
                    />
                  ) : (
                    <CgProfile className="h-8 w-8 text-slate-300" />
                  )}
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="text-slate-400">Olá,</span>
                    <span className="font-semibold text-slate-100 max-w-30 truncate" title={user.name}>
                      {user.name?.split(' ')[0]}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-slate-900/80 border border-slate-800 hover:border-rose-900/50 py-1.5 px-3 rounded-lg transition-colors cursor-pointer ml-2"
                  title="Terminar sessão"
                >
                  <FiLogOut className="h-3.5 w-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
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
            )}
          </li>
        </ul>
      </nav>

      {/* Botão do Menu Mobile (Hambúrguer) */}
      <div className="flex items-center gap-4 md:hidden">
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative hover:text-emerald-400 transition-colors flex items-center cursor-pointer"
          title="Abrir carrinho"
        >
          <BsCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2.5 bg-amber-500 text-slate-950 font-bold text-[10px] h-4 w-4 rounded-full flex items-center justify-center shadow-md">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-200 hover:text-white focus:outline-none cursor-pointer"
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
            className="text-lg font-medium hover:text-emerald-400 transition"
          >
            Início
          </Link>
          <Link 
            href="/products" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-medium hover:text-emerald-400 transition"
          >
            Produtos
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-medium hover:text-emerald-400 transition"
          >
            Contato
          </Link>
          
          <hr className="border-slate-800 my-2" />

          {isLoading ? (
            <div className="h-10 w-full bg-slate-800/80 animate-pulse rounded-xl" />
          ) : isAuthenticated && user ? (
            <div className="flex flex-col gap-4 pt-2">
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {fullImageUrl ? (
                  <img
                    src={fullImageUrl}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <CgProfile className="h-8 w-8 text-slate-300" />
                )}
                <div className="flex flex-col text-xs leading-tight">
                  <span className="text-slate-400">Conectado como</span>
                  <span className="font-semibold text-slate-100">{user.name}</span>
                </div>
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-900/50 text-rose-400 hover:bg-rose-500/20 py-2.5 rounded-xl text-sm font-medium transition"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </header>
  );
}