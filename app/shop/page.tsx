"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSheet } from "@/components/shop/FilterSheet";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortOption } from "@/lib/types";

function ShopContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
    const [sortBy, setSortBy] = useState<SortOption>("popularity");

    const filteredProducts = useMemo(() => {
        let result = products;

        if (selectedCategory) {
            result = result.filter((p) => p.category.toLowerCase().replace(" ", "-") === selectedCategory || p.category.toLowerCase() === selectedCategory);
        } // Simple slug match check, in real app ensure slug consistency

        // Better slug match:
        if (selectedCategory) {
            result = result.filter(p => {
                // Mock data category is "Sarees", slug is "sarees". 
                // Check if product category (lowercase) includes the slug or equals it.
                // Or strictly match against the categories data.
                return p.category.toLowerCase() === selectedCategory.toLowerCase();
            });
        }

        result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

        switch (sortBy) {
            case "price-asc":
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); // Mock newest sort
                break;
            default:
                // popularity - mock assumption
                break;
        }

        return result;
    }, [selectedCategory, priceRange, sortBy]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="font-serif text-3xl font-bold">
                    {selectedCategory ? (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)) : "All Collection"}
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
                {/* Desktop Filter Sidebar is inside FilterSheet component but rendered specifically for md:flex */}

                <div className="w-full">
                    {filteredProducts.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                            <p>No products found matching your criteria.</p>
                            <Button variant="link" onClick={() => { setSelectedCategory(null); setPriceRange([0, 100000]); }}>Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
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
        < Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ShopContent />
        </Suspense>
    )
}
