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
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog";

const POPULAR_SEARCHES = [
    { label: "Silk Sarees", icon: Sparkles },
    { label: "New Arrivals", icon: TrendingUp },
    { label: "Wedding Collection", icon: Sparkles },
    { label: "Banarasi", icon: Sparkles },
    { label: "Kurtis", icon: TrendingUp },
];

const RECENT_SEARCHES_KEY = "rupalicollection_recent_searches";

export function GlobalSearch({ showTrigger = true, className }: { showTrigger?: boolean; className?: string }) {
    const isOpen = useStore((state) => state.isSearchOpen);
    const setIsOpen = useStore((state) => state.setIsSearchOpen);
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
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-primary/5 active:scale-90 transition-transform"
                    >
                        <Search className="h-4.5 w-4.5 text-foreground/80" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogPortal forceMount>
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <DialogOverlay asChild>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-[6px] z-[100]"
                                />
                            </DialogOverlay>
                            <DialogContent
                                forceMount
                                onOpenAutoFocus={(e) => e.preventDefault()}
                                className="fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 max-w-full rounded-none rounded-t-[2.5rem] bg-background p-0 shadow-2xl z-[101] border-none outline-none overflow-hidden min-h-[85vh] max-h-[90vh] flex flex-col focus:outline-none"
                            >
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                                    className="h-full flex flex-col"
                                >
                                    {/* Handle for Bottom Sheet */}
                                    <div className="flex justify-center py-4">
                                        <div className="h-1.5 w-14 rounded-full bg-muted-foreground/10" />
                                    </div>

                                    {/* Search Input Area */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="px-6 pb-6"
                                    >
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                                {isLoading ? (
                                                    <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                                                ) : (
                                                    <Search className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                )}
                                            </div>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="Search sarees, kurtis, accessories..."
                                                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-secondary/40 border-none outline-none text-[15px] font-medium placeholder:text-muted-foreground/50 transition-all focus:bg-background focus:ring-1 focus:ring-primary/10 shadow-sm"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                autoFocus
                                            />
                                            {query && (
                                                <button
                                                    onClick={() => setQuery("")}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Content Area */}
                                    <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
                                        <AnimatePresence mode="wait">
                                            {query.trim() === "" ? (
                                                <motion.div
                                                    key="suggestions"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-10 py-2"
                                                >
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
                                                            <div className="flex flex-wrap gap-2">
                                                                {recentSearches.map((term) => (
                                                                    <button
                                                                        key={term}
                                                                        onClick={() => setQuery(term)}
                                                                        className="px-4 py-2 rounded-xl bg-muted/30 hover:bg-muted text-xs font-bold transition-colors"
                                                                    >
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
                                                        <div className="flex flex-wrap gap-2">
                                                            {POPULAR_SEARCHES.map((item) => (
                                                                <button
                                                                    key={item.label}
                                                                    onClick={() => setQuery(item.label)}
                                                                    className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-secondary/40 hover:bg-primary/5 hover:text-primary text-[13px] font-bold transition-all border border-transparent hover:border-primary/10"
                                                                >
                                                                    <item.icon className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
                                                                    {item.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {/* Recommended Collections */}

                                                </motion.div>
                                            ) : results.products.length === 0 && results.categories.length === 0 && !isLoading ? (
                                                <motion.div
                                                    key="no-results"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex flex-col items-center py-24 text-center"
                                                >
                                                    <div className="mb-6 rounded-full bg-muted/20 p-10 ring-1 ring-muted/30">
                                                        <Search className="h-10 w-10 text-muted-foreground/20" />
                                                    </div>
                                                    <h3 className="text-xl font-bold font-serif">No matches found</h3>
                                                    <p className="mt-3 text-sm text-muted-foreground/60 max-w-[240px] leading-relaxed">
                                                        Try checking for typos or searching for more general terms like "silk" or "blue".
                                                    </p>
                                                    <Button
                                                        variant="link"
                                                        className="mt-4 text-primary font-bold"
                                                        onClick={() => setQuery("")}
                                                    >
                                                        Clear everything
                                                    </Button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="results"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="space-y-12 py-2"
                                                >
                                                    {/* Products Section */}
                                                    {results.products.length > 0 && (
                                                        <section className="space-y-4">
                                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-2">Matching Products</h3>
                                                            <div className="grid gap-3">
                                                                {results.products.map((product) => (
                                                                    <Link
                                                                        key={product.id}
                                                                        href={`/product/${product.id}`}
                                                                        onClick={() => onResultClick(product.name)}
                                                                        className="group flex gap-4 p-3 rounded-2xl border bg-white shadow-xs transition-all hover:border-primary/20 hover:shadow-sm active:scale-[0.98]"
                                                                    >
                                                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-secondary/10">
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
                                                                            <div className="mt-2 flex items-baseline gap-2">
                                                                                <span className="text-sm font-extrabold text-primary">{formatPrice(product.sale_price || product.price)}</span>
                                                                                {product.sale_price && (
                                                                                    <span className="text-[10px] text-muted-foreground line-through opacity-50 font-medium">
                                                                                        {formatPrice(product.price)}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1">
                                                                                <span>View Details</span>
                                                                                <ArrowRight className="h-2.5 w-2.5" />
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </section>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </DialogContent>
                        </>
                    )}
                </AnimatePresence>
            </DialogPortal>
        </Dialog>
    );
}
