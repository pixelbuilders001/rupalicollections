"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { History } from "lucide-react";

const RECENTLY_VIEWED_KEY = "rupalicollection_recently_viewed";

export function useRecentlyViewed() {
    const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (saved) {
            try {
                setViewedProducts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recently viewed products", e);
            }
        }
    }, []);

    const addProduct = (product: Product) => {
        setViewedProducts((prev) => {
            const updated = [product, ...prev.filter((p) => p.id !== product.id)].slice(0, 10);
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return { viewedProducts, addProduct };
}

export function RecentlyViewed({ title = "Recently Viewed" }: { title?: string }) {
    const { viewedProducts } = useRecentlyViewed();

    if (viewedProducts.length === 0) return null;

    return (
        <section className="px-4 lg:container lg:mx-auto lg:px-6">
            <div className="flex items-center gap-2 mb-4 lg:mb-8">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground uppercase tracking-widest">{title}</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {viewedProducts.map((product) => (
                    <div key={product.id} className="w-[160px] md:w-[220px] flex-shrink-0 snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}
