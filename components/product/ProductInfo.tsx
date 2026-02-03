"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Minus, Plus, ShoppingBag, Truck, Ruler, Share2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { addToCartServerAction } from "@/app/actions/cart-actions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProductInfoProps {
    product: Product;
    isWishlisted?: boolean;
}

export function ProductInfo({ product, isWishlisted = false }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isLiked, setIsLiked] = useState(isWishlisted);
    const addToCart = useStore((state) => state.addToCart);
    const addToWishlist = useStore((state) => state.addToWishlist);
    const removeFromWishlist = useStore((state) => state.removeFromWishlist);
    const cartCount = useStore((state) => state.cartCount());
    const router = useRouter();

    // Sync isLiked state if prop changes (e.g. after server hydration)
    // useEffect(() => setIsLiked(isWishlisted), [isWishlisted]); 

    const displayPrice = product.sale_price || product.price;
    const originalPrice = product.sale_price ? product.price : null;
    const discount = originalPrice ? calculateDiscount(displayPrice, originalPrice) : null;

    const handleAddToCart = async () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        setIsAdding(true);
        try {
            // Always update local store for immediate UI feedback
            addToCart(product, quantity, selectedSize || "One Size");

            // Check auth status
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // API call (Server Action) for logged in users
                const result = await addToCartServerAction(product.id, quantity);
                if (result.success) {
                    toast.success("Added to cart & synced!");
                } else {
                    console.warn("Sync failed:", result.error);
                    toast.success("Added to cart locally!");
                }
            } else {
                toast.success("Added to cart!");
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleWishlist = async () => {
        if (!isLiked) {
            setIsLiked(true);
            addToWishlist(product);
            toast.success("Added to wishlist!");
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
        } else {
            setIsLiked(false);
            removeFromWishlist(product.id);
            toast.success("Removed from wishlist");
            try {
                const { removeFromWishlistAction } = await import("@/app/actions/wishlist-actions");
                const result = await removeFromWishlistAction(product.id);
                if (!result.success) {
                    setIsLiked(true);
                    console.error("Remove from wishlist failed", result.error);
                }
            } catch (err) {
                console.error(err);
                setIsLiked(true);
            }
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out ${product.name} on Rupali Collection!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
            window.open(whatsappUrl, '_blank');
        }
    };


    return (
        <div className="flex flex-col gap-6 pb-24 md:pb-0">
            <div>
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Premium Collection</p>
                    <div className="flex gap-2">
                        <button onClick={handleShare} className="rounded-full bg-secondary/50 p-2 text-foreground/70 transition-colors active:bg-secondary">
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <h1 className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground md:text-4xl">{product.name}</h1>

                <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-foreground">{formatPrice(displayPrice)}</span>
                    {originalPrice && (
                        <>
                            <span className="text-base text-muted-foreground line-through decoration-muted-foreground/60">
                                {formatPrice(originalPrice)}
                            </span>
                            <span className="text-sm font-bold text-green-600">
                                ({discount}% OFF)
                            </span>
                        </>
                    )}
                </div>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Inclusive of all taxes</p>
            </div>

            {/* Attributes */}
            <div className="space-y-6">
                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground select-none">Select Size</span>
                            <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                <Ruler className="h-3 w-3" /> Size Guide
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-medium transition-all duration-300",
                                        selectedSize === size
                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                                            : "border-border bg-background text-foreground/70 hover:border-primary active:scale-90"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {!selectedSize && <p className="text-[10px] font-medium text-red-500 animate-pulse">Choose your size to proceed</p>}
                    </div>
                )}
            </div>

            {/* Description & Details - Mini Accordion style or just clean flow */}
            <div className="space-y-6 border-t pt-6">
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Product Details</h3>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {product.description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-secondary/20 p-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fabric</span>
                        <span className="text-xs font-medium">{product.fabric || "Premium Silk"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Occasion</span>
                        <span className="text-xs font-medium">Festive / Party</span>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions - The Mobile App "Buy" Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t bg-background/95 p-4 pb-safe backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none transition-all">
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                        "h-12 w-14 shrink-0 rounded-xl transition-all active:scale-95",
                        isLiked ? "border-red-100 bg-red-50 text-red-500" : "border-border bg-background"
                    )}
                    onClick={handleWishlist}
                >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                </Button>

                <div className="flex flex-1 gap-2">
                    <Button
                        variant="secondary"
                        className="h-12 flex-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        loading={isAdding}
                    >
                        Add to Bag
                    </Button>
                    <Button
                        className="h-12 flex-1 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95"
                        size="lg"
                        disabled={product.stock === 0 || cartCount === 0}
                        onClick={() => router.push("/cart")}
                    >
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
