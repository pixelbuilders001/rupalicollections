"use client";

import { useEffect, useState } from "react";
import { getWishlistAction } from "@/app/actions/wishlist-actions";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center mt-16">
                <div className="mb-6 rounded-full bg-red-50 p-6">
                    <Heart className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Your Wishlist is Empty</h1>
                <p className="mt-2 text-muted-foreground">Save items you love to your wishlist and review them here.</p>
                <Link href="/shop" className="mt-8">
                    <Button size="lg" className="rounded-full px-8 gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-20 pt-8 mt-16">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">My Wishlist</h1>
                        <p className="text-muted-foreground mt-1">{products.length} {products.length === 1 ? 'item' : 'items'} saved</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {products.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ProductCard
                                product={product}
                                isWishlisted={true}
                                onRemove={() => fetchWishlist()}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
