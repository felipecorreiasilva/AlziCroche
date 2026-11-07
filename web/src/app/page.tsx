'use client';

import { ProductService } from "@/service/productService";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext"; // Importa o hook do carrinho

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { addToCart } = useCart(); // Extrai a função addToCart do contexto global

  // Carregar produtos da API
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await ProductService.getAllProducts();
        setProducts(response);
      } catch (err) {
        console.error('Erro ao carregar produtos: ', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Slide automático a cada 4 segundos
  useEffect(() => {
    if (products.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [products]);

  const currentProduct = products[currentIndex];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Primeira Seção: Hero Banner */}
      <section className="min-h-screen flex justify-center items-center pt-28 pb-20">
        <main className="w-full max-w-6xl px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            
            {/* Lado Esquerdo: Logo, Título e Descrição */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
              <img className="h-64 w-auto mb-2" src="/logo.png" alt="Logo AlziCrochê" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-wide mb-3">Bem-vindo</h1>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                Descubra peças artesanais exclusivas feitas à mão com muito carinho e alta qualidade, trazendo mais charme, aconchego e autenticidade para o seu dia a dia.
              </p>
            </div>

            {/* Lado Direito: Imagem limpa com bolinhas indicadoras abaixo */}
            <div className="flex flex-col items-center justify-center">
              {loading ? (
                <div className="h-80 w-80 flex items-center justify-center text-slate-400">
                  Carregando...
                </div>
              ) : products.length > 0 && currentProduct ? (
                <div className="flex flex-col items-center">
                  <img 
                    key={currentProduct.id}
                    className="h-80 w-80 object-cover rounded-2xl shadow-2xl transition-all duration-700 ease-in-out" 
                    src={`${process.env.NEXT_PUBLIC_API_URL}${currentProduct.image_url}`} 
                    alt={currentProduct.name} 
                  />

                  {/* Bolinhas (Indicadores de Posição do Slide) */}
                  <div className="flex justify-center gap-2 mt-4">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Ir para o slide ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          currentIndex === index 
                            ? "w-8 bg-slate-200" 
                            : "w-2.5 bg-slate-600 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-80 w-80 flex items-center justify-center text-slate-500">
                  Nenhum produto encontrado.
                </div>
              )}
            </div>

          </div>
        </main>
      </section>

      {/* Transição SVG entre as seções */}
      <div className="w-full overflow-hidden leading-none bg-white">
        <svg 
          className="relative block w-full h-16 md:h-24" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path 
            fill="#0F172A" 
            fillOpacity="1" 
            d="M0,320L240,160L480,224L720,192L960,160L1200,64L1440,96L1440,0L1200,0L960,0L720,0L480,0L240,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* Segunda Seção: Catálogo de Produtos (Background Branco) */}
      <section className="bg-white text-slate-900 pb-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800">
              Nossos Produtos Exclusivos
            </h2>
            <p className="text-slate-600 mt-2 text-base md:text-lg">
              Escolha a peça artesanal perfeita para você ou para presentear alguém especial
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12 text-slate-500">
              Carregando catálogo...
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagem com efeito hover suave */}
                    <div className="overflow-hidden bg-slate-100">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.image_url}`} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Detalhes do Produto */}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-slate-800 line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Preço e Botão de Comprar */}
                  <div className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Preço
                      </span>
                      <span className="text-xl font-bold text-slate-900">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl shadow transition duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Nenhum produto cadastrado no momento.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}