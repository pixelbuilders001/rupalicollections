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
        <Link href={`/product/${product.id}`} className="group relative block overflow-hidden rounded-md bg-card shadow-sm transition-all hover:shadow-md">
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
                {/* Discount Badge - Mini */}
                {discount && (
                    <div className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/20">
                        -{discount}%
                    </div>
                )}

                {/* Wishlist Button - Minimal */}
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
                    className="absolute right-1.5 top-1.5 rounded-full bg-white/70 p-1.5 text-foreground backdrop-blur-md transition-transform active:scale-90"
                >
                    <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-red-500 text-red-500")} />
                </button>
            </div>

            {/* Info - Compact App Style */}
            <div className="p-2 pt-1.5 space-y-0.5">
                <h3 className="truncate text-[13px] font-medium leading-tight text-foreground/90">{product.name}</h3>
                <p className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">{product.sku || "Collection"}</p>

                <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-foreground">{formatPrice(displayPrice)}</span>
                    {originalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
