'use client';

import { useEffect, useState, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { FaHeart, FaShoppingBag, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { ProductService } from "@/service/productService";
import { FavoriteService } from "@/service/favoriteService";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext"; // Importa o hook do carrinho
import { Product } from "@/types/product";

interface ProductDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

function ProductDetailContent({ params }: ProductDetailPageProps) {
    const resolvedParams = use(params);
    const productId = Number(resolvedParams.id);

    const router = useRouter();
    const { isAuthenticated } = useAuth() as any;
    const { addToCart } = useCart(); // Extrai a função addToCart do contexto

    const [product, setProduct] = useState<Product | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!productId || isNaN(productId)) {
            setError("Produto inválido.");
            setIsLoading(false);
            return;
        }

        async function fetchProductDetails() {
            try {
                setIsLoading(true);
                const products = await ProductService.getAllProducts();
                const foundProduct = products.find((p) => p.id === productId);

                if (!foundProduct) {
                    setError("Peça não encontrada.");
                    return;
                }

                setProduct(foundProduct);

                if (isAuthenticated) {
                    const favorites = await FavoriteService.getFavorites();
                    const favorited = favorites.some((fav) => Number(fav.product_id) === productId);
                    setIsFavorited(favorited);
                }
            } catch (err) {
                console.error("Erro ao carregar detalhes do produto:", err);
                setError("Não foi possível carregar os detalhes da peça.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProductDetails();
    }, [productId, isAuthenticated]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        try {
            setIsFavorited(!isFavorited);
            await FavoriteService.toggleFavorite(productId);
        } catch (err) {
            console.error("Erro ao atualizar favorito:", err);
            setIsFavorited(isFavorited);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product); // Adiciona ao carrinho e abre o modal automaticamente via Contexto
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-slate-500 pt-20">
                <FaSpinner className="animate-spin text-3xl text-amber-500" />
                <p className="text-sm">A carregar detalhes da peça...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pt-20">
                <div className="text-center bg-slate-50 p-8 rounded-2xl border border-slate-200 max-w-md w-full">
                    <p className="text-slate-700 font-medium mb-4">{error || "Peça não encontrada."}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-md"
                    >
                        Voltar ao Catálogo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-800 pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-8 transition-colors"
                >
                    <FaArrowLeft className="text-[10px]" /> Voltar para o catálogo
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    
                    <div className="relative h-87.5 md:h-125 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                        {product.image_url ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${product.image_url}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest">
                                Sem Imagem
                            </div>
                        )}

                        {product.category && (
                            <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border border-amber-500/20">
                                {product.category}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col justify-between h-full bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                                {product.name}
                            </h1>

                            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                                R$ {Number(product.price).toFixed(2).replace('.', ',')}
                            </div>

                            <div className="border-t border-slate-200 pt-6 mb-6">
                                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                                    Descrição da Peça
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {product.description || "Nenhuma descrição informada para esta peça exclusiva."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                            >
                                <FaShoppingBag className="text-amber-400" /> Adicionar ao Carrinho
                            </button>

                            {isAuthenticated && (
                                <button
                                    onClick={handleToggleFavorite}
                                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all shadow-sm ${
                                        isFavorited
                                            ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                                    }`}
                                    title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                >
                                    <FaHeart className="text-sm" />
                                    <span className="text-xs font-semibold sm:hidden">
                                        {isFavorited ? "Favoritado" : "Favoritar"}
                                    </span>
                                </button>
                            )}
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-slate-500 pt-20">
                <FaSpinner className="animate-spin text-3xl text-emerald-500" />
                <p className="text-sm">A carregar detalhes da peça...</p>
            </div>
        }>
            <ProductDetailContent params={params} />
        </Suspense>
    );
}