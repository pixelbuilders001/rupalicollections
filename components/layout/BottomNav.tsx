"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export function BottomNav() {
    const pathname = usePathname();
    const cartCount = useStore((state) => state.cartCount());
    const [isMounted, setIsMounted] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        setIsMounted(true);

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check profiles table first
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                setAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url || null);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setAvatarUrl(session.user.user_metadata?.avatar_url || null);
            } else {
                setAvatarUrl(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: Grid },
        { href: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
        { href: "/account", label: "Profile", icon: User, avatar: avatarUrl },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-white/20 pb-safe pt-2">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-2 px-4 w-16"
                        >
                            <div className="relative z-10">
                                {item.avatar ? (
                                    <div className={cn(
                                        "relative h-6 w-6 overflow-hidden rounded-full border transition-all duration-300",
                                        isActive ? "border-primary -translate-y-1" : "border-border"
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
                                            "h-6 w-6 transition-all duration-300",
                                            isActive ? "text-primary -translate-y-1" : "text-muted-foreground"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                )}

                                {item.count ? (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold"
                                    >
                                        {isMounted ? item.count : 0}
                                    </motion.span>
                                ) : null}
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute inset-0 flex flex-col items-center justify-end pb-1"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                    {/* Soft glow separation or background pill if desired, here just a text label transition */}

                                </motion.div>
                            )}

                            <motion.span
                                animate={{
                                    opacity: isActive ? 1 : 0.6,
                                    scale: isActive ? 1 : 0.9,
                                    fontWeight: isActive ? 600 : 400
                                }}
                                className={cn(
                                    "text-[10px] mt-1 transition-colors duration-300",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </motion.span>

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeDot"
                                    className="absolute top-0 h-1 w-8 rounded-b-full bg-primary"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
            <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
    );
}
