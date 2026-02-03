"use client";

import { useState } from "react";
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
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">{product.name}</h1>
                <p className="text-muted-foreground">Premium Indian Collection</p>

                <div className="mt-4 flex items-end gap-3">
                    <span className="text-2xl font-bold">{formatPrice(displayPrice)}</span>
                    {originalPrice && (
                        <>
                            <span className="text-lg text-muted-foreground line-through">
                                {formatPrice(originalPrice)}
                            </span>
                            <Badge variant="destructive" className="ml-2">
                                -{discount}% OFF
                            </Badge>
                        </>
                    )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Attributes */}
            <div className="space-y-4">
                {/* Size */}
                {product.sizes && product.sizes.length > 0 && (
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-semibold">Select Size</span>
                            <button className="flex items-center gap-1 text-xs text-primary underline">
                                <Ruler className="h-3 w-3" /> Size Chart
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-all",
                                        selectedSize === size
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-input bg-background hover:border-primary"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {!selectedSize && <p className="mt-1 text-xs text-red-500">Please select a size</p>}
                    </div>
                )}

                {/* Quantity */}
                {/* Disabled for now, keep simple single add or simple counter */}
            </div>

            {/* Actions */}
            <div className="flex gap-4 sticky bottom-0 bg-background md:static py-4 md:py-0 border-t md:border-t-0 z-20">
                <div className="flex items-center rounded-md border">
                    <button
                        className="h-10 w-10 flex items-center justify-center hover:bg-muted"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                    <button
                        className="h-10 w-10 flex items-center justify-center hover:bg-muted"
                        onClick={() => setQuantity(quantity + 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <Button
                    className="flex-1 gap-2"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    loading={isAdding}
                >
                    <ShoppingBag className="h-5 w-5" />
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={handleWishlist}
                >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={handleShare}
                >
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>

            {/* Details */}
            <div className="space-y-4 rounded-lg bg-secondary/20 p-4 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold min-w-[80px]">Fabric:</span>
                    <span>{product.fabric || "Silk / Georgette Mix"}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold min-w-[80px]">Fit:</span>
                    <span>Regular Fit</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold min-w-[80px]">Delivery:</span>
                    <span className="flex items-center gap-1 text-green-600">
                        <Truck className="h-3 w-3" /> Dispatched in 2-3 business days
                    </span>
                </div>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
            </div>
        </div>
    );
}
