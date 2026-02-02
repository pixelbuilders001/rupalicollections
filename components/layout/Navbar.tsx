"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCartServerAction } from "@/app/actions/cart-actions";

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
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || null);

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
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Mobile Menu & Logo */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-primary/20 md:h-12 md:w-12">
                            <Image
                                src="/logo.png"
                                alt="Rupali Collection"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <span className="font-serif text-xl font-bold tracking-tight text-primary">
                            Rupali Collection
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden gap-8 md:flex">
                    <Link href="/" className="text-sm font-medium hover:text-primary">
                        Home
                    </Link>
                    <Link href="/shop" className="text-sm font-medium hover:text-primary">
                        Shop
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary">
                        Our Story
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <Heart className="h-5 w-5" />
                    </Button>
                    {/* <Link href="/account">
                        <Button variant="ghost" size="icon" className="overflow-hidden">
                            {avatarUrl ? (
                                <div className="relative h-6 w-6 overflow-hidden rounded-full border border-border">
                                    <Image
                                        src={avatarUrl}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </Button>
                    </Link> */}
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingBag className="h-5 w-5" />
                            {isMounted && cartCount > 0 && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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
