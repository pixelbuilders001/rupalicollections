"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Minus, Plus, ShoppingBag, Truck, Ruler, Share2, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { addToCartServerAction } from "@/app/actions/cart-actions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { checkServiceabilityAction } from "@/app/actions/pincode-actions";
import { MapPin, Search as SearchIcon, Check, AlertCircle } from "lucide-react";
import { getAddresses } from "@/app/actions/address-actions";
import { Address } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../common/BackButton";

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
    const serviceablePincode = useStore((state) => state.serviceablePincode);
    const serviceableCity = useStore((state) => state.serviceableCity);
    const serviceableState = useStore((state) => state.serviceableState);
    const setServiceablePincode = useStore((state) => state.setServiceablePincode);
    const router = useRouter();

    // Pincode Serviceability State
    const [pincode, setPincode] = useState("");
    const [pincodeStatus, setPincodeStatus] = useState<"unchecked" | "checking" | "serviceable" | "unserviceable">("unchecked");
    const [pincodeMessage, setPincodeMessage] = useState("");
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

    // Auto-check on mount: prioritize store, then fallback to default address
    useEffect(() => {
        const initPincode = async () => {
            // 1. Check if we already have a searched pincode in store
            if (serviceablePincode) {
                setPincode(serviceablePincode);
                setPincodeStatus("serviceable");
                return;
            }

            // 2. Otherwise, check for default saved address
            const result = await getAddresses();
            if (result.success && result.data) {
                const defaultAddr = result.data.find(a => a.is_default) || result.data[0];
                if (defaultAddr && defaultAddr.pincode) {
                    setDefaultAddress(defaultAddr);
                    setPincode(defaultAddr.pincode);

                    setPincodeStatus("checking");
                    const checkResult = await checkServiceabilityAction(defaultAddr.pincode);
                    if (checkResult.success) {
                        if (checkResult.serviceable) {
                            setPincodeStatus("serviceable");
                            setPincodeMessage(checkResult.message || "");
                            // NOTE: We don't necessarily need to set global store here if it's just the default
                        } else {
                            setPincodeStatus("unserviceable");
                            setPincodeMessage(checkResult.message || "");
                        }
                    } else {
                        setPincodeStatus("unchecked");
                    }
                }
            }
        };
        initPincode();
    }, [serviceablePincode]);

    // Sync isLiked state if prop changes (e.g. after server hydration)
    // useEffect(() => setIsLiked(isWishlisted), [isWishlisted]); 

    const displayPrice = product.sale_price || product.price;
    const originalPrice = product.sale_price ? product.price : null;
    const discount = originalPrice ? calculateDiscount(displayPrice, originalPrice) : null;

    const handleAddToCart = async () => {
        if (pincodeStatus !== "serviceable") {
            if (!pincode) {
                toast.error("", {
                    description: "Please enter your delivery pincode to check availability."
                });
            } else if (pincode.length < 6) {
                toast.error("Invalid Pincode", {
                    description: "Please enter a valid 6-digit delivery pincode."
                });
            } else {
                toast.error("Serviceability Check Required", {
                    description: `Please click 'Check' to verify if we deliver to ${pincode}.`
                });
            }

            // Scroll to pincode input for better UX
            const pincodeInput = document.getElementById("pincode-input");
            if (pincodeInput) {
                pincodeInput.scrollIntoView({ behavior: "smooth", block: "center" });
                pincodeInput.focus();

                // Add a temporary highlight effect
                pincodeInput.classList.add("ring-offset-2", "ring-primary");
                setTimeout(() => {
                    pincodeInput.classList.remove("ring-offset-2", "ring-primary");
                }, 2000);
            }
            return;
        }

        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        setIsAdding(true);
        try {
            // Check auth status
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // API call (Server Action) for logged in users
                const result = await addToCartServerAction(product.id, quantity);
                if (result.success) {
                    // Update local store only after server confirmation for logged in users
                    addToCart(product, quantity, selectedSize || "One Size");
                    toast.success("Added to cart");
                } else {
                    console.warn("Sync failed:", result.error);
                    // Fallback: still update local store if API failed but we want to allow guest-like behavior?
                    // Actually user said: "once api call is succesfull on adding cart then show"
                    // So we only update store on success.
                    toast.error("Failed to add to cart. Please try again.");
                }
            } else {
                // For guest users, update local store immediately but after the session check
                addToCart(product, quantity, selectedSize || "One Size");
                toast.success("Added to cart!");
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        router.push("/cart");
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

    const handlePincodeCheck = async () => {
        if (!pincode || pincode.length !== 6) {
            toast.error("Please enter a valid 6-digit pincode");
            return;
        }

        setPincodeStatus("checking");
        const result = await checkServiceabilityAction(pincode);

        if (result.success) {
            if (result.serviceable) {
                setPincodeStatus("serviceable");
                setPincodeMessage(result.message || "");

                // Only store in global store if it's a NEW pincode (not in saved addresses)
                const addrRes = await getAddresses();
                const isSaved = addrRes.success && addrRes.data?.some(a => a.pincode === pincode);

                if (!isSaved) {
                    setServiceablePincode(pincode, result.city, result.state);
                } else {
                    setServiceablePincode(null, null, null); // Clear session search if it's a saved address
                }

                toast.success(result.message);
            } else {
                setPincodeStatus("unserviceable");
                setPincodeMessage(result.message || "");
                toast.error(result.message);
            }
        } else {
            setPincodeStatus("unchecked");
            toast.error(result.error || "Failed to check serviceability");
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
        <div className="flex flex-col gap-5 md:gap-6 md:sticky md:top-24 md:pb-10 pb-32">
            {/* Header Section */}
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">Premium</span>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Collection</p>
                    </div>
                    <button onClick={handleShare} className="rounded-full bg-secondary/30 p-2.5 text-foreground/70 transition-all active:scale-90 hover:bg-secondary">
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>

                <h1 className="mt-2 font-serif text-2xl font-black leading-tight text-foreground md:text-4xl">{product.name}</h1>

                <div className="mt-4 flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground">{formatPrice(displayPrice)}</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">MRP Incl. of all taxes</p>
                    </div>
                    {originalPrice && (
                        <div className="flex flex-col items-start gap-0.5 border-l pl-4">
                            <span className="text-sm text-muted-foreground/60 line-through font-bold">
                                {formatPrice(originalPrice)}
                            </span>
                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                {discount}% OFF
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sizes Selection */}
            {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-foreground">Select Size</span>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">EU/UK</span>
                        </div>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                            <Ruler className="h-3.5 w-3.5" /> Size Guide
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={cn(
                                    "relative group flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-300",
                                    selectedSize === size
                                        ? "border-primary bg-primary text-white shadow-[0_8px_20px_-6px_rgba(var(--primary-rgb),0.5)] scale-105"
                                        : "border-secondary bg-secondary/10 text-foreground/70 hover:border-primary/50 hover:bg-white active:scale-95"
                                )}
                            >
                                <span className="text-sm font-bold">{size}</span>
                                {selectedSize === size && (
                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Check className="h-2.5 w-2.5 text-primary stroke-[4]" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    {!selectedSize && <p className="text-[10px] font-bold text-primary tracking-wide animate-pulse uppercase">Choose a size to Bag it</p>}
                </div>
            )}

            {/* Delivery Availability */}
            <div className="rounded-3xl bg-secondary/5 border border-white/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Check Delivery</span>
                    </div>
                    {pincodeStatus === "serviceable" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 text-[9px] uppercase font-black tracking-tighter rounded-lg border-none">
                            Serviceable
                        </Badge>
                    )}
                </div>

                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            id="pincode-input"
                            type="text"
                            placeholder="Enter 6-digit Pincode"
                            value={pincode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setPincode(val);
                                if (pincodeStatus !== "unchecked") setPincodeStatus("unchecked");
                            }}
                            className={cn(
                                "h-12 w-full rounded-2xl border-2 bg-white/50 px-4 text-sm font-bold transition-all focus:bg-white focus:outline-none focus:ring-4 placeholder:text-muted-foreground/50",
                                pincodeStatus === "serviceable" ? "border-green-200 ring-green-500/5" :
                                    pincodeStatus === "unserviceable" ? "border-red-200 ring-red-500/5" :
                                        "border-transparent focus:ring-primary/10"
                            )}
                        />
                        {pincodeStatus === "checking" && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        )}
                        {pincodeStatus === "serviceable" && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                    </div>
                    <Button
                        onClick={handlePincodeCheck}
                        disabled={pincode.length !== 6 || pincodeStatus === "checking"}
                        variant="secondary"
                        className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest bg-white shadow-sm border hover:bg-gray-50 transition-all border-none"
                    >
                        {pincodeStatus === "serviceable" ? "Modify" : "Check"}
                    </Button>
                </div>

                {pincodeStatus === "serviceable" && (
                    <div className="flex flex-col gap-2 pt-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            Expected Delivery by <span className="text-foreground">7th Feb</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Story / Details */}
            <div className="space-y-6 pt-2">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Product Story</span>
                        <div className="h-[2px] flex-1 bg-secondary/20" />
                    </div>
                    <p className="text-[13px] font-medium leading-[1.6] text-muted-foreground/80">
                        {product.description}
                    </p>
                </div>

                {/* <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 rounded-2xl bg-secondary/10 p-4 border border-white/40">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">Fabric</span>
                        <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{product.fabric || "Premium Silk Blend"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 rounded-2xl bg-secondary/10 p-4 border border-white/40">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">Care</span>
                        <span className="text-[11px] font-black uppercase tracking-tight text-foreground">Dry Clean Only</span>
                    </div>
                </div> */}
            </div>

            {/* Final Sticky Checkout Bar - Improved for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] md:static md:z-0 md:mt-4">
                <div className="bg-white/95 backdrop-blur-xl border-t border-primary/10 p-4 pb-safe md:bg-transparent md:border-0 md:p-0 md:backdrop-blur-none transition-all shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.1)] md:shadow-none">
                    <div className="container mx-auto max-w-7xl flex items-center gap-3 md:flex-row-reverse md:gap-4 md:px-0">
                        {/* Desktop: Share button moves here or stays up? Stays up. Wishlist button here. */}

                        <div className="flex flex-1 gap-2.5 md:flex-col md:gap-4">
                            <Button
                                className={cn(
                                    "h-14 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-lg shadow-primary/20 md:h-12 md:text-sm md:w-full",
                                    isAdding && "opacity-80"
                                )}
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                loading={isAdding}
                            >
                                {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                            </Button>

                            {/* Wishlist Button - Desktop integrated here if needed, or keep separate. 
                                On mobile it's a separate icon button. 
                                On desktop, let's make it a secondary button full width.
                            */}
                            <Button
                                variant="outline"
                                className={cn(
                                    "hidden md:flex h-12 w-full rounded-2xl text-sm font-bold uppercase tracking-wider border-2 hover:bg-secondary/20",
                                    isLiked && "border-red-200 text-red-500 bg-red-50"
                                )}
                                onClick={handleWishlist}
                            >
                                {isLiked ? "Wishlisted" : "Add to Wishlist"} <Heart className={cn("ml-2 h-4 w-4", isLiked && "fill-current")} />
                            </Button>
                        </div>

                        {/* Mobile Wishlist Button */}
                        <Button
                            variant="secondary"
                            size="icon"
                            className={cn(
                                "h-14 w-14 shrink-0 rounded-2xl transition-all active:scale-95 border-2 shadow-sm md:hidden",
                                isLiked ? "border-red-100 bg-red-50 text-red-500" : "border-secondary bg-white"
                            )}
                            onClick={handleWishlist}
                        >
                            <Heart className={cn("h-6 w-6 transition-transform duration-300", isLiked && "fill-current scale-110")} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
