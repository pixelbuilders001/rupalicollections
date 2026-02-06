"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ShoppingBag, ArrowRight, Loader2, Package, TrendingUp, History, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { searchProductsAction } from "@/app/actions/product-actions";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
    Dialog,
    DialogContent,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = [
    { label: "Silk Sarees", icon: Sparkles },
    { label: "New Arrivals", icon: TrendingUp },
    { label: "Wedding Collection", icon: Sparkles },
    { label: "Banarasi", icon: Sparkles },
    { label: "Kurtis", icon: TrendingUp },
];

const RECENT_SEARCHES_KEY = "rupalicollection_recent_searches";

export function DesktopGlobalSearch() {
    const isOpen = useStore((state) => state.isDesktopSearchOpen);
    const setIsOpen = useStore((state) => state.setIsDesktopSearchOpen);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ products: Product[], categories: any[] }>({ products: [], categories: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) setRecentSearches(JSON.parse(saved));
        }
    }, [isOpen]);

    const addToRecentSearches = useCallback((term: string) => {
        if (!term.trim()) return;
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }, [recentSearches]);

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ products: [], categories: [] });
            return;
        }

        setIsLoading(true);
        const result = await searchProductsAction(searchQuery);
        if (result.success && result.data) {
            setResults(result.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) handleSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    const closeSearch = () => {
        setIsOpen(false);
        setQuery("");
        setResults({ products: [], categories: [] });
    };

    const onResultClick = (term: string) => {
        addToRecentSearches(term);
        closeSearch();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="top-28 translate-y-0 sm:max-w-3xl border-none shadow-[0_32px_128px_rgba(0,0,0,0.2)] p-0 overflow-hidden rounded-[2.5rem] bg-white">
                <div className="flex flex-col max-h-[80vh]">
                    {/* Search Input Area */}
                    <div className="p-8 border-b border-secondary/10">
                        <div className="relative group">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : (
                                    <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                )}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search for sarees, kurtis, and more..."
                                className="w-full h-12 pl-10 pr-10 rounded-none bg-transparent border-none outline-none text-xl font-medium placeholder:text-muted-foreground/30 transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 no-scrollbar min-h-[300px]">
                        {query.trim() === "" ? (
                            <div className="grid grid-cols-2 gap-10">
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                                                <History className="h-3 w-3" /> Recent Searches
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setRecentSearches([]);
                                                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                                                }}
                                                className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {recentSearches.map((term) => (
                                                <button
                                                    key={term}
                                                    onClick={() => setQuery(term)}
                                                    className="flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl hover:bg-secondary/10 text-sm font-bold transition-colors w-full text-left"
                                                >
                                                    <Search className="h-3.5 w-3.5 opacity-30" />
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Popular Searches */}
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" /> Popular Searches
                                    </h3>
                                    <div className="flex flex-col gap-1">
                                        {POPULAR_SEARCHES.map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => setQuery(item.label)}
                                                className="flex items-center gap-3 px-3 py-2 -ml-3 rounded-xl hover:bg-primary/5 hover:text-primary text-sm font-bold transition-all w-full text-left group"
                                            >
                                                <item.icon className="h-3.5 w-3.5 opacity-30 group-hover:opacity-100" />
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        ) : results.products.length === 0 && results.categories.length === 0 && !isLoading ? (
                            <div className="flex flex-col items-center py-12 text-center">
                                <div className="mb-6 rounded-3xl bg-muted/20 p-8 ring-1 ring-muted/30">
                                    <Search className="h-8 w-8 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-xl font-bold font-serif">No matches found</h3>
                                <p className="mt-3 text-sm text-muted-foreground/60 max-w-[240px] leading-relaxed">
                                    Try checking for typos or searching for more general terms.
                                </p>
                            </div>
                        ) : (
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Results for "{query}"</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {results.products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            onClick={() => onResultClick(product.name)}
                                            className="group flex gap-4 p-3 rounded-2xl border bg-white shadow-xs transition-all hover:border-primary/20 hover:shadow-md active:scale-[0.98]"
                                        >
                                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-secondary/10">
                                                {product.thumbnail_url && (
                                                    <Image
                                                        src={product.thumbnail_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center flex-1 pr-2 min-w-0">
                                                <h4 className="text-[13px] font-bold leading-tight group-hover:text-primary transition-colors truncate">{product.name}</h4>
                                                <div className="mt-1 flex items-baseline gap-2">
                                                    <span className="text-sm font-extrabold text-primary">{formatPrice(product.sale_price || product.price)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {results.products.length > 0 && (
                                    <Button
                                        variant="outline"
                                        className="w-full mt-4 rounded-xl font-bold uppercase text-[10px] tracking-widest h-10"
                                        onClick={() => {
                                            router.push(`/shop?q=${encodeURIComponent(query)}`);
                                            closeSearch();
                                        }}
                                    >
                                        View All Results
                                    </Button>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
