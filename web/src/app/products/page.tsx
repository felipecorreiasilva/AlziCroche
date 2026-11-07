'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch, FaShoppingBag, FaHeart, FaSpinner } from "react-icons/fa";
import { ProductService } from "@/service/productService";
import { FavoriteService } from "@/service/favoriteService";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types/product";

export default function ProductsPage() {
    const { isAuthenticated } = useAuth() as any;
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const productsData = await ProductService.getAllProducts();
                setProducts(productsData);
                setFilteredProducts(productsData);

                if (isAuthenticated) {
                    const favoritesData = await FavoriteService.getFavorites();
                    const ids = favoritesData.map((fav) => Number(fav.product_id)).filter(Boolean);
                    setFavoriteIds(ids);
                }
            } catch (err: any) {
                console.error("Erro ao carregar dados:", err);
                setError("Não foi possível carregar as peças. Tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [isAuthenticated]);

    useEffect(() => {
        let result = products;

        if (searchQuery.trim() !== "") {
            result = result.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== "all") {
            result = result.filter((product) => product.category === selectedCategory);
        }

        setFilteredProducts(result);
    }, [searchQuery, selectedCategory, products]);

    const handleToggleFavorite = async (productId?: number) => {
        if (!isAuthenticated || !productId) return;

        try {
            const isAlreadyFavorited = favoriteIds.includes(productId);
            if (isAlreadyFavorited) {
                setFavoriteIds(favoriteIds.filter((id) => id !== productId));
            } else {
                setFavoriteIds([...favoriteIds, productId]);
            }

            await FavoriteService.toggleFavorite(productId);
        } catch (err) {
            console.error("Erro ao atualizar favorito:", err);
            const favoritesData = await FavoriteService.getFavorites();
            setFavoriteIds(favoritesData.map((fav) => Number(fav.product_id)).filter(Boolean));
        }
    };

    const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

    return (
        <div className="min-h-screen bg-white text-slate-800 pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Cabeçalho */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
                        Nossas Peças em Crochê
                    </h1>
                    <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
                        Explore a coleção exclusiva da AlziCrochê feita à mão com carinho, técnica e materiais de alta qualidade.
                    </p>
                </div>

                {/* Barra de Pesquisa e Filtros */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
                    
                    {/* Campo de Busca */}
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Buscar por peça ou detalhe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-amber-500 transition-all shadow-sm"
                        />
                    </div>

                    {/* Filtros de Categoria */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat || "all")}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                                    selectedCategory === cat
                                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                {cat === "all" ? "Todas as peças" : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                        <FaSpinner className="animate-spin text-3xl text-amber-500" />
                        <p className="text-sm">A carregar o catálogo...</p>
                    </div>
                ) : (
                    <>
                        {/* Lista Vazia */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                                <p className="text-slate-600 text-base mb-2">Nenhuma peça encontrada.</p>
                                <p className="text-slate-400 text-xs">Tente alterar o termo de busca ou o filtro de categoria.</p>
                            </div>
                        ) : (
                            /* Grelha de Produtos */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => {
                                    const isFavorited = product.id !== undefined && favoriteIds.includes(product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            className="group bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-amber-500/60 transition-all duration-300 flex flex-col"
                                        >
                                            {/* Contentor da Imagem */}
                                            <div className="relative h-64 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                                                {product.image_url ? (
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.image_url}`}
                                                        alt={product.name}
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest">
                                                        Sem Imagem
                                                    </div>
                                                )}

                                                {/* Tag de Categoria */}
                                                {product.category && (
                                                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-amber-500/20">
                                                        {product.category}
                                                    </span>
                                                )}

                                                {/* Botão de Favorito */}
                                                {isAuthenticated && (
                                                    <button 
                                                        onClick={() => handleToggleFavorite(product.id)}
                                                        aria-label="Guardar nos favoritos"
                                                        className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full transition-colors shadow-sm ${
                                                            isFavorited 
                                                                ? "bg-red-500 text-white" 
                                                                : "bg-white/90 text-slate-600 hover:text-red-500"
                                                        }`}
                                                    >
                                                        <FaHeart className="text-xs" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Detalhes do Produto */}
                                            <div className="p-5 flex flex-col grow justify-between gap-4">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                                                        {product.name}
                                                    </h3>
                                                    {product.description && (
                                                        <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Preço</span>
                                                        <span className="text-lg font-bold text-slate-900">
                                                            R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                                                    >
                                                        <FaShoppingBag className="text-xs text-amber-400" /> Detalhes
                                                    </Link>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}