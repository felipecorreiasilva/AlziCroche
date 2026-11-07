'use client'
import { Product, ProductService } from "@/service/productService";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Fallback caso a env esteja undefined

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await ProductService.getAllProducts();
        console.log("Produtos carregados da API:", response); // Diagnóstico no Console do Navegador (F12)
        setProducts(response);
      } catch (err) {
        console.error('Erro ao carregar produtos: ', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center pt-28 bg-[#3D2C2E] text-white">
      <main className="w-full max-w-7xl px-8">
        <section>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <img className="h-64 w-auto" src="/logo.png" alt="AlziCrochê" />
              <h1 className="text-3xl font-bold mt-4">Bem vindo</h1>
            </div>

            <div className="flex gap-4 overflow-x-auto py-4">
              {loading ? (
                <p className="text-slate-300">Carregando produtos...</p>
              ) : products.length > 0 ? (
                products.map((product) => {
                  // Garante a formatação correta da URL da imagem
                  const imageUrl = product.image_url?.startsWith('http')
                    ? product.image_url
                    : `${API_URL}${product.image_url?.startsWith('/') ? '' : '/'}${product.image_url}`;

                  return (
                    <div key={product.id} className="flex-shrink-0 bg-[#4A373A] p-3 rounded-xl shadow-lg">
                      {product.image_url ? (
                        <img 
                          src={imageUrl} 
                          alt={product.name || "Produto AlziCrochê"}
                          className="h-64 w-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-64 w-64 bg-stone-700 flex items-center justify-center rounded-lg text-slate-400">
                          Sem imagem
                        </div>
                      )}
                      <p className="mt-2 font-semibold text-center">{product.name}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400">Nenhum produto retornado do banco.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}