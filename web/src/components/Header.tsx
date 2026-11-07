import { BsCart } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";

export default function Header() {
  return (
    <header className="flex justify-between py-4 px-16 items-center bg-[#0F172A] text-white">
      <a href="/">
        <img className="h-16 w-auto object-contain" src="logo.png" alt="AlziCrochê" />
      </a>
      <nav>
        <ul className="flex items-center gap-8">
          <li><a href="/" className="hover:opacity-80 transition-opacity">Home</a></li>
          <li><a href="/products" className="hover:opacity-80 transition-opacity">Produtos</a></li>
          <li><a href="/contact" className="hover:opacity-80 transition-opacity">Contato</a></li>
          <li>
            <a href="/cart" className="hover:opacity-80 transition-opacity">
              <BsCart className="h-5 w-5" />
            </a>
          </li>
          <li>
            <div className="flex items-center gap-x-2">
              <CgProfile className="h-6 w-6 text-slate-300" />
              <div className="flex flex-col text-[11px] leading-tight">
                <span className="text-slate-400">Bem-vindo(a)</span>
                <div>
                  <a href="/login" className="font-semibold hover:underline">Entrar</a>
                  <span className="mx-1 text-slate-400">|</span>
                  <a href="/register" className="font-semibold hover:underline">Criar Conta</a>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}