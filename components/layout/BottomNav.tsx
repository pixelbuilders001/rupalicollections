"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { getUserProfile } from "@/app/actions/user-actions";

export function BottomNav() {
    const pathname = usePathname();
    const cartCount = useStore((state) => state.cartCount());
    const userProfile = useStore((state) => state.userProfile);
    const setUserProfile = useStore((state) => state.setUserProfile);
    const [isMounted, setIsMounted] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        setIsMounted(true);

        const initAuth = async () => {
            const result = await getUserProfile();
            if (result.success && result.data) {
                setUserProfile({
                    name: result.data.name,
                    avatar_url: result.data.avatar_url || null
                });
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const result = await getUserProfile();
                if (result.success && result.data) {
                    setUserProfile({
                        name: result.data.name,
                        avatar_url: result.data.avatar_url || null
                    });
                } else {
                    setUserProfile({
                        name: session.user.user_metadata?.full_name || "Guest",
                        avatar_url: session.user.user_metadata?.avatar_url || null
                    });
                }
            } else {
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, setUserProfile]);

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: Grid },
        { href: "/wishlist", label: "Wishlist", icon: Heart, count: useStore((state) => state.wishlistCount()) },
        { href: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
        { href: "/account", label: "Profile", icon: User, avatar: userProfile?.avatar_url },
    ];

    // Hide bottom nav on product details page to avoid overlap with sticky action bar
    if (pathname.startsWith("/product/")) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/40 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-16 h-12 py-1"
                        >
                            {/* Active pill background */}
                            {isActive && (
                                <motion.div
                                    layoutId="navTab"
                                    className="absolute inset-0 mx-auto my-auto h-8 w-12 rounded-full bg-primary/10 -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className="relative">
                                {item.avatar ? (
                                    <div className={cn(
                                        "relative h-6 w-6 overflow-hidden rounded-full border transition-all duration-300",
                                        isActive ? "border-primary scale-110" : "border-border"
                                    )}>
                                        <Image
                                            src={item.avatar}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <item.icon
                                        className={cn(
                                            "h-5.5 w-5.5 transition-all duration-300",
                                            isActive ? "text-primary" : "text-muted-foreground/70"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                )}

                                {item.count ? (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -right-2 -top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] text-white font-extrabold ring-2 ring-background"
                                    >
                                        {isMounted ? item.count : 0}
                                    </motion.span>
                                ) : null}
                            </div>

                            <span
                                className={cn(
                                    "text-[9px] mt-1 transition-all duration-300 tracking-tight",
                                    isActive ? "text-primary font-bold" : "text-muted-foreground/60 font-medium"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area padding for mobile browsers */}
            <div className="h-[env(safe-area-inset-bottom)] bg-background/95" />
        </div>
    );
}
