"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function Navbar() {
    const cartCount = useStore((state) => state.cartCount());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                    <Link href="/account">
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </Link>
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
