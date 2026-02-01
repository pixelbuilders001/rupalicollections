"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
    const { cartTotal, clearCart } = useStore();
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState(false);

    // Quick calculation again (should share logic ideally)
    const total = cartTotal();
    const delivery = total > 2999 ? 0 : 99;
    const finalTotal = total + delivery;

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSuccess(true);
            clearCart();
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Order Placed Successfully!</h1>
                <p className="mt-2 text-muted-foreground max-w-md">
                    Thank you for shopping with Rupali Collection. Your order #78902 has been confirmed.
                </p>
                <Link href="/" className="mt-8">
                    <Button size="lg">Continue Shopping</Button>
                </Link>
            </div>
        )
    }

    if (total === 0) {
        router.push("/cart");
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 font-serif text-3xl font-bold">Checkout</h1>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Forms */}
                <form onSubmit={handlePlaceOrder} className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Contact Information</h2>
                        <input
                            type="email"
                            required
                            placeholder="Email Address"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                            type="tel"
                            required
                            placeholder="Phone Number"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Shipping Address</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                placeholder="First Name"
                                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                            <input
                                required
                                placeholder="Last Name"
                                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <input
                            required
                            placeholder="Address Line 1"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                            placeholder="Apartment, suite, etc. (optional)"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                required
                                placeholder="City"
                                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                            <input
                                required
                                placeholder="PIN Code"
                                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                        </div>
                        <input
                            required
                            placeholder="State"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Payment Method</h2>
                        <div className="space-y-2">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
                                <input type="radio" name="payment" className="accent-primary" defaultChecked />
                                <span>UPI / Netbanking / Cards</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-muted/50">
                                <input type="radio" name="payment" className="accent-primary" />
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full font-semibold">
                        Pay {formatPrice(finalTotal)} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                {/* Summary (Hidden on mobile if needed, but good to show) */}
                <div className="hidden h-fit space-y-4 rounded-lg bg-muted/30 p-6 lg:block">
                    <h2 className="font-serif text-lg font-semibold">Order Preview</h2>
                    <div className="text-sm text-muted-foreground">
                        <p>Items Total: {formatPrice(total)}</p>
                        <p>Delivery: {delivery === 0 ? "Free" : formatPrice(delivery)}</p>
                        <div className="mt-4 border-t pt-4 text-base font-bold text-foreground">
                            Total Payload: {formatPrice(finalTotal)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
