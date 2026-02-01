"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, cartTotal } = useStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

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
            <h1 className="mb-8 font-serif text-3xl font-bold">Shopping Cart</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.cartId} className="flex gap-4 rounded-lg border p-4 bg-card">
                            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <div className="flex justify-between">
                                        <h3 className="font-medium line-clamp-1">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-muted-foreground hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                                    <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center rounded-md border h-8">
                                        <button
                                            className="h-8 w-8 flex items-center justify-center hover:bg-muted"
                                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <button
                                            className="h-8 w-8 flex items-center justify-center hover:bg-muted"
                                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
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

                    <Link href="/checkout">
                        <Button className="w-full mt-6" size="lg">
                            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
