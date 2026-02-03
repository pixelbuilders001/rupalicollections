"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSheet } from "@/components/shop/FilterSheet";
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

function ShopContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [sortBy, setSortBy] = useState<SortOption>("popularity");
    const [categories, setCategories] = useState<any[]>([]);
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchProductsByFilter = async () => {
            setLoading(true);
            try {
                const result = await getProducts({ categorySlug: selectedCategory });
                if (result.success && result.data) {
                    setProductsList(result.data);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByFilter();
    }, [selectedCategory]);

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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="font-serif text-3xl font-bold">
                    {activeCategoryName}
                </h1>

                <div className="flex items-center gap-2">
                    <FilterSheet
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowUpDown className="h-4 w-4" /> Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSortBy("popularity")}>Popularity</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest Arrivals</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("price-asc")}>Price: Low to High</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("price-desc")}>Price: High to Low</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex gap-8">
                <div className="w-full">
                    {loading ? (
                        <FullPageLoader />
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                            <p>No products found matching your criteria.</p>
                            <Button variant="link" onClick={() => { setSelectedCategory(null); setPriceRange([0, 100000]); }}>Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isWishlisted={wishlistIds.has(product.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<FullPageLoader />}>
            <ShopContent />
        </Suspense>
    )
}
