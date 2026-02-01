"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useStore } from "@/lib/store";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const addToWishlist = useStore((state) => state.addToWishlist);

    return (
        <Link href={`/product/${product.id}`} className="group relative block overflow-hidden rounded-lg bg-card shadow-sm transition-all hover:shadow-md">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {/* Discount Badge */}
                {product.discount && (
                    <Badge className="absolute left-2 top-2 bg-red-800 text-white hover:bg-red-900">
                        -{product.discount}%
                    </Badge>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsLiked(!isLiked);
                        addToWishlist(product);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-foreground backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                </button>

                {/* Quick Add (Desktop) */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-black/40 p-2 text-center text-white backdrop-blur-sm transition-transform group-hover:translate-y-0 hidden md:block">
                    <span className="text-sm font-medium">Quick View</span>
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="line-clamp-1 text-sm font-medium text-foreground">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>

                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
