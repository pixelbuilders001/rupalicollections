"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getCategories } from "@/app/actions/product-actions";

interface FilterSidebarProps {
    selectedCategory: string | null;
    setSelectedCategory: (c: string | null) => void;
    priceRange: [number, number];
    setPriceRange: (r: [number, number]) => void;
    className?: string;
}

export function FilterSidebar({
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    className
}: FilterSidebarProps) {
    const [categoriesList, setCategoriesList] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await getCategories();
            if (result.success && result.data) {
                setCategoriesList(result.data);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className={cn("flex flex-col gap-8", className)}>
            <div>
                <h3 className="mb-4 font-serif text-lg font-bold">Categories</h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                            "text-left text-sm transition-all hover:translate-x-1",
                            !selectedCategory ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All Collection
                    </button>
                    {categoriesList.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={cn(
                                "text-left text-sm transition-all hover:translate-x-1",
                                selectedCategory === cat.slug ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="mb-4 font-serif text-lg font-bold">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={priceRange[1] === 100000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceRange([0, 100000])}
                        className="h-8 rounded-full text-xs"
                    >
                        All Prices
                    </Button>
                    <Button
                        variant={priceRange[1] === 2000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceRange([0, 2000])}
                        className="h-8 rounded-full text-xs"
                    >
                        Under ₹2k
                    </Button>
                    <Button
                        variant={priceRange[1] === 5000 && priceRange[0] === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceRange([0, 5000])}
                        className="h-8 rounded-full text-xs"
                    >
                        Under ₹5k
                    </Button>
                    <Button
                        variant={priceRange[0] === 5000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPriceRange([5000, 100000])}
                        className="h-8 rounded-full text-xs"
                    >
                        Above ₹5k
                    </Button>
                </div>
            </div>
        </div>
    );
}
