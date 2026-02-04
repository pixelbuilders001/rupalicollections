"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToCartServerAction } from "@/app/actions/cart-actions";
import { CartItem } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function MergeCartPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        const mergeGuestCart = async () => {
            try {
                // Get guest cart items from localStorage
                const storedData = localStorage.getItem('rupalicollection-storage');

                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    const guestItems: CartItem[] = parsedData.state?.items || [];

                    // If there are guest cart items, add them to the user's cart
                    if (guestItems.length > 0) {
                        console.log('Merging guest cart items:', guestItems);

                        // IMPORTANT: Clear the Zustand store items FIRST to prevent duplication
                        useStore.getState().setCartItems([]);
                        useStore.getState().setIsLoggedIn(true);

                        // Add each item to the user's cart
                        for (const item of guestItems) {
                            try {
                                await addToCartServerAction(item.id, item.quantity);
                            } catch (error) {
                                console.error('Failed to add item to cart:', item, error);
                            }
                        }

                        // Clear the guest cart from localStorage
                        const updatedData = {
                            ...parsedData,
                            state: {
                                ...parsedData.state,
                                items: []
                            }
                        };
                        localStorage.setItem('rupalicollection-storage', JSON.stringify(updatedData));
                    } else {
                        // No guest items, just update login state
                        useStore.getState().setIsLoggedIn(true);
                    }
                }
            } catch (error) {
                console.error('Error merging guest cart:', error);
            } finally {
                // Redirect to the intended destination
                router.replace(next);
            }
        };

        mergeGuestCart();
    }, [router, next]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-muted-foreground">Setting up your account...</p>
            </div>
        </div>
    );
}
