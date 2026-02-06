"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, ShoppingBag, X } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { addToCartServerAction } from "@/app/actions/cart-actions";

interface ProductCardProps {
    product: Product;
    isWishlisted?: boolean;
    onRemove?: () => void;
}

export function ProductCard({ product, isWishlisted = false, onRemove }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(isWishlisted);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [imgErrorIndices, setImgErrorIndices] = useState<Set<number>>(new Set());

    const addToWishlist = useStore((state) => state.addToWishlist);
    const removeFromWishlist = useStore((state) => state.removeFromWishlist);
    const addToCart = useStore((state) => state.addToCart);

    useEffect(() => {
        setIsLiked(isWishlisted);
    }, [isWishlisted]);

    const displayPrice = product.sale_price || product.price;
    const originalPrice = product.sale_price ? product.price : null;
    const discount = (originalPrice && displayPrice) ? calculateDiscount(displayPrice, originalPrice) : null;

    const allImages = [
        product.thumbnail_url,
        ...(product.images || [])
    ].filter(Boolean) as string[];

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!product.sizes || product.sizes.length === 0) {
            handleAddToCart("One Size");
        } else {
            setShowQuickAdd(true);
        }
    };

    const handleAddToCart = async (size: string) => {
        setIsAdding(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            const result = await addToCartServerAction(product.id, 1, size);
            if (result.success) {
                addToCart(product, 1, size);
                toast.success(`Added ${product.name} (${size}) to bag`);
            } else {
                toast.error("Failed to add to bag. Please try again.");
                console.error("API sync failed:", result.error);
            }
        } else {
            addToCart(product, 1, size);
            toast.success(`Added ${product.name} (${size}) to bag`);
        }

        setTimeout(() => {
            setIsAdding(false);
            setShowQuickAdd(false);
            setSelectedSize(null);
        }, 500);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const width = e.currentTarget.offsetWidth;
        const index = Math.round(scrollLeft / width);
        if (index !== currentImgIndex) {
            setCurrentImgIndex(index);
        }
    };

    return (
        <div className="group relative block overflow-hidden rounded-md bg-card shadow-sm transition-all hover:shadow-md">
            <Link href={`/product/${product.id}`}>
                {/* Image Gallery Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {/* Horizontal Scroll Gallery */}
                    <div
                        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                        onScroll={handleScroll}
                    >
                        {allImages.length > 0 ? (
                            allImages.map((img, idx) => (
                                <div key={idx} className="relative h-full w-full flex-shrink-0 snap-start">
                                    <Image
                                        src={imgErrorIndices.has(idx) ? "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop" : img}
                                        alt={`${product.name} - ${idx + 1} | Rupali Collection`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                        priority={idx === 0}
                                        onError={() => setImgErrorIndices(prev => new Set(prev).add(idx))}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="relative h-full w-full flex-shrink-0 snap-start bg-muted flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                            </div>
                        )}
                    </div>

                    {/* Pagination Indicators */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10 pointer-events-none">
                            {allImages.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-300",
                                        currentImgIndex === idx ? "w-4 bg-white shadow-sm" : "w-1 bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Size Picker Overlay */}
                    <AnimatePresence>
                        {showQuickAdd && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center bg-white/95 p-3 pb-4 backdrop-blur-md border-t border-primary/10 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)]"
                                onClick={(e) => e.preventDefault()}
                            >
                                <div className="w-full">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Choose your Size</span>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowQuickAdd(false);
                                            }}
                                            className="rounded-full bg-secondary/30 p-1.5 text-foreground/70 active:scale-90"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.sizes?.map((size) => (
                                            <button
                                                key={size}
                                                disabled={isAdding}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleAddToCart(size);
                                                }}
                                                className={cn(
                                                    "flex h-9 items-center justify-center rounded-xl border border-secondary bg-white text-[11px] font-black transition-all active:scale-95 disabled:opacity-50",
                                                    isAdding ? "cursor-wait" : "hover:border-primary hover:bg-primary hover:text-white"
                                                )}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Discount Badge - Mini */}
                    {discount && (
                        <div className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/20 z-10">
                            -{discount}%
                        </div>
                    )}

                    {/* Wishlist Button - Minimal */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                                setIsLiked(false);
                                removeFromWishlist(product.id);

                                try {
                                    const { removeFromWishlistAction } = await import("@/app/actions/wishlist-actions");
                                    const result = await removeFromWishlistAction(product.id);
                                    if (result.success) {
                                        if (onRemove) onRemove();
                                    } else {
                                        setIsLiked(true);
                                        console.error("Remove from wishlist failed", result.error);
                                    }
                                } catch (err) {
                                    console.error(err);
                                    setIsLiked(true);
                                }
                            }
                        }}
                        className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white/70 p-1.5 text-foreground backdrop-blur-md transition-transform active:scale-90"
                    >
                        <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-red-500 text-red-500")} />
                    </button>
                </div>

                {/* Info - Compact App Style */}
                <div className="p-2 pt-1.5 space-y-0.5">
                    <h3 className="truncate text-[13px] font-medium leading-tight text-foreground/90">{product.name}</h3>
                    <p className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">{product.sku || "Collection"}</p>

                    <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-bold text-foreground">{formatPrice(displayPrice)}</span>
                            {originalPrice && (
                                <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/50">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Integrated Add Button */}
                        <button
                            disabled={isAdding}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQuickAdd(e);
                            }}
                            className="flex h-7 items-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-black active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                            {isAdding ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                <>
                                    <Plus className="h-3 w-3" />
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
