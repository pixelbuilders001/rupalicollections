"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCartServerAction } from "@/app/actions/cart-actions";
import { getUserProfile } from "@/app/actions/user-actions";

export function Navbar() {
    const cartCount = useStore((state) => state.cartCount());
    const setCartItems = useStore((state) => state.setCartItems);
    const [isMounted, setIsMounted] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const supabase = createClient();

    const syncCart = useCallback(async () => {
        const result = await getCartServerAction();
        if (result.success && result.data) {
            const serverItems = result.data.map((item: any) => ({
                ...item.products,
                cartId: item.id,
                quantity: item.qty,
                price: item.price,
                selectedSize: item.size || "One Size",
                id: item.product_id
            }));
            setCartItems(serverItems);
        }
    }, [setCartItems]);

    useEffect(() => {
        setIsMounted(true);

        const initAuth = async () => {
            const result = await getUserProfile();
            if (result.success && result.data) {
                setAvatarUrl(result.data.avatar_url || null);
                // Sync cart
                syncCart();
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setAvatarUrl(session.user.user_metadata?.avatar_url || null);
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    syncCart();
                }
            } else {
                setAvatarUrl(null);
                if (event === 'SIGNED_OUT') {
                    useStore.getState().clearCart();
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md transition-all">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-primary/20 shadow-sm">
                        <Image
                            src="/logo.png"
                            alt="Rupali Collection"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="flex flex-col -gap-1">
                        <span className="font-serif text-[15px] font-black leading-tight text-primary">
                            Rupali
                        </span>
                        <span className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] leading-tight text-primary/80">
                            Collections
                        </span>
                    </div>
                </Link>

                {/* Actions - Simplified */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Search className="h-4.5 w-4.5 text-foreground/80" />
                    </Button>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative h-9 w-9">
                            <ShoppingBag className="h-4.5 w-4.5 text-foreground/80" />
                            {isMounted && cartCount > 0 && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white ring-2 ring-background">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
