"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, ShieldCheck, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCartServerAction, removeFromCartServerAction, updateCartQuantityServerAction } from "@/app/actions/cart-actions";
import { CartItem } from "@/lib/types";
import { BackButton } from "@/components/common/BackButton";
import { CartLoader } from "@/components/cart/CartLoader";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
    const { items, cartTotal, setCartItems, addToWishlist } = useStore();
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        try {
            const result = await getCartServerAction();
            if (result.success && result.data) {
                const cartItems = result.data.cart?.cart_items || (Array.isArray(result.data) ? result.data : []);

                const serverItems = cartItems.map((item: any) => ({
                    ...item.products,
                    cartId: item.id,
                    quantity: item.qty,
                    price: item.price,
                    selectedSize: item.size || "One Size",
                    id: item.product_id
                }));
                setCartItems(serverItems);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    }, [setCartItems]);

    useEffect(() => {
        setIsMounted(true);
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await createClient().auth.getSession();
            if (session) {
                await fetchCart();
            } else {
                setLoading(false);
            }
        };
        checkAuthAndFetch();
    }, [fetchCart]);

    const handleUpdateQuantity = async (cartId: string, quantity: number) => {
        if (quantity < 1) return;
        setIsUpdating(cartId);

        useStore.getState().updateQuantity(cartId, quantity);

        const { data: { session } } = await createClient().auth.getSession();
        if (session) {
            const result = await updateCartQuantityServerAction(cartId, quantity);
            if (!result.success) {
                fetchCart();
            }
        }
        setIsUpdating(null);
    };

    const handleRemoveFromCart = async (cartId: string) => {
        setIsRemoving(cartId);
        useStore.getState().removeFromCart(cartId);

        const { data: { session } } = await createClient().auth.getSession();
        if (session) {
            const result = await removeFromCartServerAction(cartId);
            if (!result.success) {
                fetchCart();
            }
        }
        setIsRemoving(null);
    };

    const handleMoveToWishlist = async (item: any) => {
        setIsRemoving(item.cartId);
        addToWishlist(item);
        useStore.getState().removeFromCart(item.cartId);

        const { data: { session } } = await createClient().auth.getSession();
        if (session) {
            await removeFromCartServerAction(item.cartId);
            const { addToWishlistAction } = await import("@/app/actions/wishlist-actions");
            await addToWishlistAction(item.id);
        }
        setIsRemoving(null);
    };

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        const { data: { session } } = await createClient().auth.getSession();

        if (!session) {
            router.push("/login?returnTo=/cart");
        } else {
            router.push("/checkout");
        }
        setIsCheckingOut(false);
    };

    if (!isMounted) return null;

    if (loading) {
        return <CartLoader />;
    }

    if (items.length === 0) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center bg-background">
                <div className="relative mb-8">
                    <div className="h-32 w-32 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ShoppingBag className="h-14 w-14 text-muted-foreground/40" />
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white"
                    >
                        <Heart className="h-5 w-5 fill-current" />
                    </motion.div>
                </div>
                <h1 className="font-serif text-2xl font-black uppercase tracking-tight">Your bag is empty</h1>
                <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-widest max-w-[240px]">
                    Discover our latest collection and find something beautiful today.
                </p>
                <Link href="/shop" className="mt-10 w-full max-w-[200px]">
                    <Button className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    const total = cartTotal();
    const delivery = total > 2999 ? 0 : 99;
    const finalTotal = total + delivery;

    return (
        <div className="bg-secondary/5 min-h-screen pb-32 md:pb-12">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h1 className="font-serif text-2xl font-black uppercase tracking-tight">Your Bag</h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    layout
                                    key={item.cartId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative flex gap-4 rounded-3xl border border-white/50 bg-white p-4 shadow-sm"
                                >
                                    <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-secondary/5 border border-secondary/10">
                                        <Image
                                            src={item.thumbnail_url || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop"}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="100px"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col py-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-black text-xs uppercase tracking-tight truncate leading-tight">{item.name}</h3>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Size: <span className="text-foreground">{item.selectedSize}</span></p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.cartId)}
                                                className="text-muted-foreground hover:text-red-500 p-1 active:scale-90 transition-all"
                                                disabled={isRemoving === item.cartId}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-auto flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-primary">{formatPrice(item.price)}</span>
                                                {/* <button 
                                                    onClick={() => handleMoveToWishlist(item)}
                                                    className="text-[9px] font-black uppercase tracking-widest text-primary mt-1 hover:underline active:opacity-60"
                                                >
                                                    Move to Wishlist
                                                </button> */}
                                            </div>

                                            <div className="flex items-center rounded-xl bg-secondary/10 p-1 border border-secondary/5">
                                                <button
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white active:bg-white/50 transition-all disabled:opacity-30"
                                                    onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}
                                                    disabled={isUpdating === item.cartId || item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-[10px] font-black uppercase">
                                                    {isUpdating === item.cartId ? ".." : item.quantity}
                                                </span>
                                                <button
                                                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white active:bg-white/50 transition-all disabled:opacity-30"
                                                    onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                                                    disabled={isUpdating === item.cartId}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary - Desktop */}
                    <div className="hidden lg:block h-fit rounded-[2rem] border border-white/50 bg-white p-6 shadow-sm">
                        <h2 className="font-serif text-xl font-black uppercase tracking-tight mb-6">Price Details</h2>

                        <div className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total MRP</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span className={delivery === 0 ? "text-green-600" : ""}>{delivery === 0 ? "FREE" : formatPrice(delivery)}</span>
                            </div>

                            <div className="my-6 h-px bg-secondary/10" />

                            <div className="flex justify-between items-center text-sm font-black text-foreground">
                                <span>Total Amount</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>

                            <div className="rounded-xl bg-green-50 p-3 text-green-700 text-[10px] mb-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Secure and authentic shopping guaranteed.</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 mt-4"
                            loading={isCheckingOut}
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Summary - Mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
                <div className="bg-white/95 backdrop-blur-xl border-t border-primary/10 p-5 shadow-[0_-12px_40px_-10px_rgba(0,0,0,0.1)]">
                    <div className="container mx-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Payable</span>
                            <span className="text-xl font-black text-foreground leading-tight">{formatPrice(finalTotal)}</span>
                            <button onClick={handleCheckout} className="text-[9px] font-bold text-primary uppercase tracking-tighter text-left hover:underline">View Price Details</button>
                        </div>

                        <Button
                            className="h-14 flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
                            loading={isCheckingOut}
                            onClick={handleCheckout}
                        >
                            Checkout Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
