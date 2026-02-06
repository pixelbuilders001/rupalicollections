"use client";

import { useEffect, useState } from "react";
import { getWishlistAction } from "@/app/actions/wishlist-actions";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";

export default function WishlistPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        setLoading(true);
        const result = await getWishlistAction();
        if (result.success && result.data) {
            setProducts(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary/5">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
                    <p className="animate-pulse text-xs font-bold uppercase tracking-[0.2rem] text-muted-foreground/40 italic">Curating your collection...</p>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="relative inline-block">
                        <div className="relative z-10 rounded-[3rem] bg-white border border-white/60 p-12 shadow-2xl backdrop-blur-sm">
                            <Heart className="h-16 w-16 text-red-400 stroke-[1.5px]" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.4, opacity: 0.1 }}
                            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                            className="absolute inset-0 bg-red-400 rounded-[3rem] -z-10"
                        />
                    </div>

                    <div className="space-y-3">
                        <h1 className="font-serif text-3xl font-black text-foreground">Your Wishlist is Waiting</h1>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                            Add the pieces you love to build your dream ethnic wardrobe.
                        </p>
                    </div>

                    <Link href="/shop" className="inline-block pt-4">
                        <Button size="lg" className="h-14 px-10 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                            <ShoppingBag className="mr-2 h-4 w-4" /> Start Exploring
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-32 pt-4">
            {/* Header Section */}
            <div className="container mx-auto px-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-8"
                >
                    <div className="space-y-1">
                        <h1 className="font-serif text-2xl font-black text-foreground md:text-5xl">My Wishlist</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Collection</span>
                            <div className="h-1 w-1 rounded-full bg-primary/30" />
                            <span className="text-[11px] font-bold text-primary">{products.length} {products.length === 1 ? 'Selection' : 'Selections'}</span>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Saved items are kept for 30 days</p>
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.08
                            }
                        }
                    }}
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: {
                                    y: 0,
                                    opacity: 1,
                                    transition: { type: "spring", stiffness: 300, damping: 24 }
                                }
                            }}
                        >
                            <ProductCard
                                product={product}
                                isWishlisted={true}
                                onRemove={() => fetchWishlist()}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
