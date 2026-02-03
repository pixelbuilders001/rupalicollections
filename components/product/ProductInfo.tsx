"use client";

import { useState, useEffect } from "react";
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
import { checkServiceabilityAction } from "@/app/actions/pincode-actions";
import { MapPin, Search as SearchIcon, Check, AlertCircle } from "lucide-react";
import { getAddresses } from "@/app/actions/address-actions";
import { Address } from "@/lib/types";
import { motion } from "framer-motion";
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
            // Always update local store for immediate UI feedback
            addToCart(product, quantity, selectedSize || "One Size");

            // Check auth status
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // API call (Server Action) for logged in users
                const result = await addToCartServerAction(product.id, quantity);
                if (result.success) {
                    toast.success("Added to cart");
                } else {
                    console.warn("Sync failed:", result.error);
                    toast.success("Added to cart!");
                }
            } else {
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
        <div className="flex flex-col gap-6 pb-24 md:pb-0">
            {/* <BackButton className="w-fit md:hidden" showLabel label="Back" /> */}
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

            {/* Pincode Serviceability Check - Premium App Style */}
            <div className="space-y-3 pt-6 border-t border-dashed border-border">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">Delivery Availability</span>
                </div>
                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Enter Pincode"
                            value={pincode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setPincode(val);
                                if (pincodeStatus !== "unchecked") setPincodeStatus("unchecked");
                            }}
                            className={cn(
                                "h-11 w-full rounded-xl border bg-secondary/10 px-4 text-sm font-medium transition-all focus:bg-background focus:outline-none focus:ring-2",
                                pincodeStatus === "serviceable" ? "border-green-200 ring-green-500/10" :
                                    pincodeStatus === "unserviceable" ? "border-red-200 ring-red-500/10" :
                                        "border-transparent focus:ring-primary/10"
                            )}
                        />
                        {pincodeStatus === "checking" && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                        {pincodeStatus === "serviceable" && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                        {pincodeStatus === "unserviceable" && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />}
                    </div>
                    <Button
                        onClick={handlePincodeCheck}
                        disabled={pincode.length !== 6 || pincodeStatus === "checking"}
                        size="sm"
                        className="h-11 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        {pincodeStatus === "serviceable" ? "Update" : "Check"}
                    </Button>
                </div>
                {/* {pincodeStatus !== "unchecked" && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "text-[11px] font-bold tracking-tight",
                            pincodeStatus === "serviceable" ? "text-green-600" : "text-red-500"
                        )}
                    >
                        {pincodeMessage}
                    </motion.p>
                )} */}
                {defaultAddress && pincodeStatus === "serviceable" && pincode === defaultAddress.pincode && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1 text-[9px] font-bold text-green-700">
                        Deliverable to: <span className="uppercase">{defaultAddress.city} - {defaultAddress.pincode}</span>
                    </div>
                )}
                <p className="text-[10px] font-medium text-muted-foreground">Please check availability before adding to bag</p>
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
                        className={cn(
                            "h-12 flex-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm hover:shadow-md",
                            pincodeStatus !== "serviceable" && "border-primary/20 bg-secondary/30"
                        )}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        loading={isAdding}
                    >
                        Add to Bag
                    </Button>
                    {cartCount > 0 && (
                        <Button
                            className="h-12 flex-1 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95"
                            size="lg"
                            onClick={handleBuyNow}
                        >
                            Go to Cart
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
