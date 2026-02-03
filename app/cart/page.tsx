"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCartServerAction, removeFromCartServerAction, updateCartQuantityServerAction } from "@/app/actions/cart-actions";
import { CartItem } from "@/lib/types";
import { BackButton } from "@/components/common/BackButton";
import { CartLoader } from "@/components/cart/CartLoader";

export default function CartPage() {
    const { items, cartTotal, setCartItems } = useStore();
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        try {
            const result = await getCartServerAction();
            if (result.success && result.data) {
                // Handle nested structure: result.data.cart.cart_items or result.data
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
            // If result.success is false and data is missing, we don't clear.
            // This preserves localStorage items for guests.
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
                setLoading(false); // Just show local items
            }
        };
        checkAuthAndFetch();
    }, [fetchCart]);

    const handleUpdateQuantity = async (cartId: string, quantity: number) => {
        if (quantity < 1) return;

        // Optimistic local update
        useStore.getState().updateQuantity(cartId, quantity);

        const { data: { session } } = await createClient().auth.getSession();
        if (session) {
            const result = await updateCartQuantityServerAction(cartId, quantity);
            if (!result.success) {
                // Revert on failure if needed, or re-fetch
                fetchCart();
            }
        }
    };

    const handleRemoveFromCart = async (cartId: string) => {
        // Optimistic local removal
        useStore.getState().removeFromCart(cartId);

        const { data: { session } } = await createClient().auth.getSession();
        if (session) {
            const result = await removeFromCartServerAction(cartId);
            if (!result.success) {
                fetchCart();
            }
        }
    };

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();

    const handleCheckout = () => {
        setIsCheckingOut(true);
        router.push("/checkout");
    };

    if (!isMounted) return null;

    if (loading) {
        return <CartLoader />;
    }

    if (items.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
                <h1 className="font-serif text-2xl font-bold">Your Cart is Empty</h1>
                <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
                <Link href="/shop" className="mt-6">
                    <Button size="lg">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    const total = cartTotal();
    const delivery = total > 2999 ? 0 : 99;
    const finalTotal = total + delivery;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* <BackButton className="mb-4" showLabel label="Back" /> */}
            <h1 className="mb-4 font-serif text-xl font-bold">Shopping Cart</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.cartId} className="flex gap-4 rounded-lg border p-4 bg-card">
                            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                <Image
                                    src={item.thumbnail_url || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop"}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <div className="flex justify-between">
                                        <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveFromCart(item.cartId)}
                                            className="text-muted-foreground hover:text-red-500 h-8 w-8"
                                            loading={isRemoving === item.cartId}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                                    <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
                                </div>

                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="flex items-center rounded-md border h-8 bg-background">
                                        <button
                                            className="h-8 w-8 flex items-center justify-center hover:bg-muted disabled:opacity-50"
                                            onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}
                                            disabled={isUpdating === item.cartId}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {isUpdating === item.cartId ? "..." : item.quantity}
                                        </span>
                                        <button
                                            className="h-8 w-8 flex items-center justify-center hover:bg-muted disabled:opacity-50"
                                            onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                                            disabled={isUpdating === item.cartId}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="h-fit rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Delivery</span>
                            <span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
                        </div>

                        <div className="my-4 border-t pt-4">
                            <div className="flex justify-between text-base font-bold">
                                <span>Total</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
                        </div>
                    </div>

                    <Button
                        className="w-full mt-6"
                        size="lg"
                        loading={isCheckingOut}
                        onClick={handleCheckout}
                    >
                        Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
