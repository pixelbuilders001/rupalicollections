"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategories } from "@/app/actions/product-actions";
import { useEffect } from "react";

interface FilterSheetProps {
    selectedCategory: string | null;
    setSelectedCategory: (c: string | null) => void;
    priceRange: [number, number];
    setPriceRange: (r: [number, number]) => void;
}

export function FilterSheet({
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
}: FilterSheetProps) {
    const [isOpen, setIsOpen] = useState(false);
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
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2 lg:hidden"
                onClick={() => setIsOpen(true)}
            >
                <Filter className="h-4 w-4" /> Filters
            </Button>



            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col bg-background p-6 shadow-xl lg:hidden"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="font-serif text-xl font-bold">Filters</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="flex-1 space-y-8 overflow-y-auto">
                                <div>
                                    <h3 className="mb-3 font-medium">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant={!selectedCategory ? "default" : "outline"}
                                            onClick={() => setSelectedCategory(null)}
                                            className="cursor-pointer px-3 py-1"
                                        >
                                            All
                                        </Badge>
                                        {categoriesList.map((cat) => (
                                            <Badge
                                                key={cat.id}
                                                variant={selectedCategory === cat.slug ? "default" : "outline"}
                                                onClick={() => setSelectedCategory(cat.slug)}
                                                className="cursor-pointer px-3 py-1"
                                            >
                                                {cat.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-medium">Price</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={priceRange[1] === 5000 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPriceRange([0, 5000])}
                                        >
                                            Under ₹5k
                                        </Button>
                                        <Button
                                            variant={priceRange[1] > 5000 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPriceRange([0, 100000])}
                                        >
                                            All
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <Button className="w-full" onClick={() => setIsOpen(false)}>
                                    Apply Filters
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
