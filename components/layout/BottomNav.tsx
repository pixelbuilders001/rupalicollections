"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function BottomNav() {
    const pathname = usePathname();
    const cartCount = useStore((state) => state.cartCount());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: Grid },
        { href: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
        { href: "/account", label: "Profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-2 pb-safe backdrop-blur-lg md:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute -top-3 h-1 w-8 rounded-full bg-primary"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <div className="relative">
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
                            {item.count ? (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                    {isMounted ? item.count : 0}
                                </span>
                            ) : null}
                        </div>
                        <span className="mt-1">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
