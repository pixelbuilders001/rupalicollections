"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

interface ProductCardProps {
    product: Product;
    isWishlisted?: boolean;
    onRemove?: () => void;
}

export function ProductCard({ product, isWishlisted = false, onRemove }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(isWishlisted);
    const addToWishlist = useStore((state) => state.addToWishlist);
    const removeFromWishlist = useStore((state) => state.removeFromWishlist);
    const [imgSrc, setImgSrc] = useState(product.thumbnail_url || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop");

    useEffect(() => {
        setIsLiked(isWishlisted);
    }, [isWishlisted]);

    const displayPrice = product.sale_price || product.price;
    const originalPrice = product.sale_price ? product.price : null;
    const discount = (originalPrice && displayPrice) ? calculateDiscount(displayPrice, originalPrice) : null;

    return (
        <Link href={`/product/${product.id}`} className="group relative block overflow-hidden rounded-lg bg-card shadow-sm transition-all hover:shadow-md">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    onError={() => setImgSrc("https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop")}
                />
                {/* Discount Badge */}
                {discount && (
                    <Badge className="absolute left-2 top-2 bg-red-800 text-white hover:bg-red-900">
                        -{discount}%
                    </Badge>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        if (!isLiked) {
                            setIsLiked(true);
                            addToWishlist(product);
                            try {
                                const { addToWishlistAction } = await import("@/app/actions/wishlist-actions");
                                const result = await addToWishlistAction(product.id);
                                if (!result.success) {
                                    setIsLiked(false);
                                    // re-toggle store state if needed, or just warn
                                    console.error("Wishlist API failed", result.error);
                                }
                            } catch (err) {
                                console.error(err);
                                setIsLiked(false);
                            }
                        }
                        else {
                            // Handle removal
                            setIsLiked(false);
                            removeFromWishlist(product.id);

                            try {
                                const { removeFromWishlistAction } = await import("@/app/actions/wishlist-actions");
                                const result = await removeFromWishlistAction(product.id);
                                if (result.success) {
                                    if (onRemove) onRemove();
                                } else {
                                    setIsLiked(true); // Revert if failed
                                    console.error("Remove from wishlist failed", result.error);
                                }
                            } catch (err) {
                                console.error(err);
                                setIsLiked(true);
                            }
                        }
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
                <p className="text-xs text-muted-foreground">{product.sku || "Product"}</p>

                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{formatPrice(displayPrice)}</span>
                    {originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
