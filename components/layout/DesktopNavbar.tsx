"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, Heart, User, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCartServerAction } from "@/app/actions/cart-actions";
import { getWishlistAction } from "@/app/actions/wishlist-actions";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "./GlobalSearch";
import { DesktopGlobalSearch } from "./DesktopGlobalSearch";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DesktopNavbar() {
    const cartCount = useStore((state) => state.cartCount());
    const setIsLoggedIn = useStore((state) => state.setIsLoggedIn);
    const setIsSearchOpen = useStore((state) => state.setIsSearchOpen);
    const setCartItems = useStore((state) => state.setCartItems);
    const setWishlistItems = useStore((state) => state.setWishlistItems);
    const isLoggedIn = useStore((state) => state.isLoggedIn);
    const userProfile = useStore((state) => state.userProfile);
    const [isMounted, setIsMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const supabase = createClient();
    const pathname = usePathname();

    const syncCart = useCallback(async () => {
        const result = await getCartServerAction();
        if (result.success && result.data) {
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
    }, [setCartItems]);

    const syncWishlist = useCallback(async () => {
        const result = await getWishlistAction();
        if (result.success && result.data) {
            setWishlistItems(result.data);
        }
    }, [setWishlistItems]);

    useEffect(() => {
        setIsMounted(true);

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsLoggedIn(true);
                syncCart();
                syncWishlist();
            } else {
                setIsLoggedIn(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setIsLoggedIn(true);
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    if (event === 'SIGNED_IN') {
                        useStore.getState().clearCart();
                    }
                    syncCart();
                    syncWishlist();
                }
            } else {
                setIsLoggedIn(false);
                if (event === 'SIGNED_OUT') {
                    useStore.getState().clearCart();
                }
            }
        });

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase, syncCart, syncWishlist, setIsLoggedIn]);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/shop", label: "Shop All" },
        { href: "/shop?sort=newest", label: "New Arrivals" },
        { href: "/shop?category=sarees", label: "Sarees" },
        { href: "/shop?category=kurtis", label: "Kurtis" },
    ];

    return (
        <header
            className={cn(
                "hidden lg:block sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
                isScrolled ? "bg-white/80 backdrop-blur-md border-border/40 shadow-sm py-2" : "bg-white py-4"
            )}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="Rupali Collection"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="flex flex-col -gap-1">
                        <span className="font-serif text-2xl font-black leading-tight text-primary tracking-tight">
                            Rupali
                        </span>
                        <span className="font-serif text-[10px] font-bold uppercase tracking-[0.3em] leading-tight text-primary/80">
                            Collections
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary relative group py-2",
                                pathname === link.href ? "text-primary font-bold" : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                            <span className={cn(
                                "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                            )} />
                        </Link>
                    ))}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    {/* Desktop Search Trigger */}
                    <div className="w-64 xl:w-80">
                        <button
                            onClick={() => useStore.getState().setIsDesktopSearchOpen(true)}
                            className="w-full h-10 px-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all flex items-center gap-3 group text-muted-foreground/50"
                        >
                            <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
                            <span className="text-xs font-medium">Search for items...</span>
                            <div className="ml-auto flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black border rounded px-1.5 py-0.5">/</span>
                            </div>
                        </button>
                        <DesktopGlobalSearch />
                    </div>

                    <div className="flex items-center gap-2 border-l border-border/50 pl-6">
                        {/* Wishlist */}
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className="group rounded-full hover:bg-primary/5 relative">
                                <Heart className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                {isMounted && useStore.getState().wishlistCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white">
                                        {useStore.getState().wishlistCount()}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* Account */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 rounded-xl px-2 hover:bg-primary/5">
                                    <div className="h-8 w-8 rounded-xl bg-secondary/50 overflow-hidden border border-border relative">
                                        {userProfile?.avatar_url ? (
                                            <Image src={userProfile.avatar_url} alt="User" fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start text-xs hidden xl:flex">
                                        <span className="font-bold text-foreground">
                                            {isLoggedIn && userProfile ? userProfile?.name?.split(' ')[0] : "Account"}
                                        </span>
                                        <span className="text-muted-foreground text-[10px]">
                                            {isLoggedIn ? "View Profile" : "Login / Signup"}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-white border border-border shadow-[0_10px_40px_rgb(0,0,0,0.1)] rounded-2xl p-2 z-[9999]">
                                <DropdownMenuLabel className="px-3 pt-3 pb-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">My Account</span>
                                        {isLoggedIn && userProfile && (
                                            <span className="text-sm font-bold text-foreground mt-0.5">{userProfile.name}</span>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-2" />
                                {isLoggedIn ? (
                                    <>
                                        <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-foreground cursor-pointer py-2.5 px-3">
                                            <Link href="/account" className="flex items-center gap-3 font-bold text-sm text-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                Profile Details
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-foreground cursor-pointer py-2.5 px-3">
                                            <Link href="/orders" className="flex items-center gap-3 font-bold text-sm text-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <ShoppingBag className="h-4 w-4" />
                                                </div>
                                                My Orders
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-foreground cursor-pointer py-2.5 px-3">
                                            <Link href="/wishlist" className="flex items-center gap-3 font-bold text-sm text-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Heart className="h-4 w-4" />
                                                </div>
                                                Wishlist
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-foreground cursor-pointer py-2.5 px-3">
                                            <Link href="/addresses" className="flex items-center gap-3 font-bold text-sm text-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                Saved Addresses
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="my-2" />
                                        <DropdownMenuItem
                                            className="rounded-xl focus:bg-red-50 focus:text-red-600 cursor-pointer py-2.5 px-3 text-red-500 font-bold text-sm flex items-center gap-3"
                                            onClick={async () => {
                                                await supabase.auth.signOut();
                                                setIsLoggedIn(false);
                                                useStore.getState().clearCart();
                                                window.location.href = "/";
                                            }}
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-red-100/50 flex items-center justify-center">
                                                <X className="h-4 w-4" />
                                            </div>
                                            Log out
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-foreground cursor-pointer py-2.5 px-3">
                                            <Link href="/login" className="flex items-center gap-3 font-bold text-sm text-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                Login/Signup
                                            </Link>
                                        </DropdownMenuItem>
                                        {/* <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 focus:text-foreground cursor-pointer py-2.5 px-3">
                                            <Link href="/login?view=signup" className="flex items-center gap-3 font-bold text-sm text-foreground">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                Sign up
                                            </Link>
                                        </DropdownMenuItem> */}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Cart */}
                        <Link href="/cart">
                            <Button className="rounded-full gap-2 px-4 shadow-sm hover:shadow-md transition-all">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="font-bold">Cart</span>
                                {isMounted && cartCount > 0 && (
                                    <span className="bg-white text-primary rounded-full px-1.5 py-0.5 text-[10px] font-black min-w-[20px] text-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
