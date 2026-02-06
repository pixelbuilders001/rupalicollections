"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSheet } from "@/components/shop/FilterSheet";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortOption, Product } from "@/lib/types";
import { getCategories, getProducts } from "@/app/actions/product-actions";
import { getWishlistIdsAction } from "@/app/actions/wishlist-actions";
import { FullPageLoader } from "@/components/ui/FullPageLoader";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";

export function ShopClient() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [sortBy, setSortBy] = useState<SortOption>("popularity");
    const [categories, setCategories] = useState<any[]>([]);
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [totalFound, setTotalFound] = useState(0);
    const LIMIT = 12;
    const offsetRef = useRef(0);

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await getCategories();
            if (result.success && result.data) {
                setCategories(result.data);
            }
        };
        const fetchWishlistIds = async () => {
            const result = await getWishlistIdsAction();
            if (result.success && result.data) {
                setWishlistIds(new Set(result.data));
            }
        };
        fetchCategories();
        fetchWishlistIds();
    }, []);

    const fetchItems = useCallback(async (isInitial = false) => {
        if (!isInitial && (!hasMore || isFetchingMore || loading)) return;

        if (isInitial) {
            setLoading(true);
            offsetRef.current = 0;
        } else {
            setIsFetchingMore(true);
        }

        try {
            const currentOffset = isInitial ? 0 : offsetRef.current;
            const result = await getProducts({
                categorySlug: selectedCategory,
                limit: LIMIT,
                offset: currentOffset,
                sortBy: sortBy,
                minPrice: priceRange[0],
                maxPrice: priceRange[1]
            });

            if (result.success && result.data) {
                if (isInitial) {
                    setProductsList(result.data);
                    offsetRef.current = result.data.length;
                } else {
                    setProductsList(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newItems = (result.data || []).filter(p => !existingIds.has(p.id));
                        return [...prev, ...newItems];
                    });
                    offsetRef.current += result.data.length;
                }
                setHasMore(result.data.length === LIMIT);
                if (result.totalCount !== undefined) {
                    setTotalFound(result.totalCount);
                }
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    }, [selectedCategory, sortBy, priceRange, hasMore, isFetchingMore, loading]);

    // Initial fetch and reset on filter change
    useEffect(() => {
        fetchItems(true);
    }, [selectedCategory, sortBy, priceRange]);

    // Intersection Observer for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductRef = useCallback((node: HTMLDivElement) => {
        if (loading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchItems();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, isFetchingMore, hasMore, fetchItems]);

    const activeCategoryName = useMemo(() => {
        if (!selectedCategory) return "All Collection";
        const cat = categories.find(c => c.slug === selectedCategory);
        return cat ? cat.name : (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1));
    }, [selectedCategory, categories]);

    const filteredProducts = useMemo(() => {
        let result = productsList;

        result = result.filter((p) => {
            const price = p.sale_price || p.price;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        switch (sortBy) {
            case "price-asc":
                result = [...result].sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
                break;
            case "price-desc":
                result = [...result].sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
                break;
            case "newest":
                result = [...result].sort((a, b) => {
                    const dateA = new Date(a.id).getTime();
                    const dateB = new Date(b.id).getTime();
                    return dateB - dateA;
                });
                break;
            default:
                break;
        }

        return result;
    }, [productsList, priceRange, sortBy]);

    // We'll handle loading state inline now for better UX

    return (
        <div className="container mx-auto px-4 py-4 md:py-8">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-xl font-bold md:text-3xl">
                            {activeCategoryName}
                        </h1>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{totalFound} Products Found</p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                        <FilterSheet
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 rounded-full text-[11px] font-bold uppercase tracking-wider bg-background">
                                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
                                <DropdownMenuItem className="text-xs rounded-lg py-2" onClick={() => setSortBy("popularity")}>Popularity</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs rounded-lg py-2" onClick={() => setSortBy("newest")}>Newest Arrivals</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs rounded-lg py-2" onClick={() => setSortBy("price-asc")}>Price: Low to High</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs rounded-lg py-2" onClick={() => setSortBy("price-desc")}>Price: High to Low</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
                    <FilterSidebar
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                    />
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 gap-y-6 lg:gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : productsList.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                            <p className="text-sm">No products found</p>
                            <Button variant="link" className="text-xs" onClick={() => { setSelectedCategory(null); setPriceRange([0, 100000]); setSortBy("popularity"); }}>Clear Filters</Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 gap-y-6 lg:gap-6">
                                {productsList.map((product, index) => (
                                    <div key={product.id} ref={index === productsList.length - 1 ? lastProductRef : null}>
                                        <ProductCard
                                            product={product}
                                            isWishlisted={wishlistIds.has(product.id)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Loading state for more items */}
                            {isFetchingMore && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 gap-y-6 lg:gap-6 mt-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <ProductSkeleton key={`more-${i}`} />
                                    ))}
                                </div>
                            )}

                            {!hasMore && productsList.length > 0 && (
                                <div className="mt-12 text-center">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">You've seen it all</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

    );
}
