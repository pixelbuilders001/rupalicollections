"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Minus, Plus, ShoppingBag, Truck, Ruler } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const addToCart = useStore((state) => state.addToCart);

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Please select a size"); // Better UI for this later (toast)
            return;
        }
        addToCart(product, quantity, selectedSize);
        alert("Added to cart!"); // Better UI (toast)
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">{product.name}</h1>
                <p className="text-muted-foreground">{product.category}</p>

                <div className="mt-4 flex items-end gap-3">
                    <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                        <>
                            <span className="text-lg text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                            <Badge variant="destructive" className="ml-2">
                                -{product.discount}% OFF
                            </Badge>
                        </>
                    )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Attributes */}
            <div className="space-y-4">
                {/* Size */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold">Select Size</span>
                        <button className="flex items-center gap-1 text-xs text-primary underline">
                            <Ruler className="h-3 w-3" /> Size Chart
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-all",
                                    selectedSize === size
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-input bg-background hover:border-primary"
                                )}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    {!selectedSize && <p className="mt-1 text-xs text-red-500">Please select a size</p>}
                </div>

                {/* Quantity */}
                {/* Disabled for now, keep simple single add or simple counter */}
            </div>

            {/* Actions */}
            <div className="flex gap-4 sticky bottom-0 bg-background md:static py-4 md:py-0 border-t md:border-t-0 z-20">
                <div className="flex items-center rounded-md border">
                    <button
                        className="h-10 w-10 flex items-center justify-center hover:bg-muted"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                    <button
                        className="h-10 w-10 flex items-center justify-center hover:bg-muted"
                        onClick={() => setQuantity(quantity + 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <Button
                    className="flex-1 gap-2"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                >
                    <ShoppingBag className="h-5 w-5" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>

                <Button variant="outline" size="icon" className="h-11 w-11">
                    <Heart className="h-5 w-5" />
                </Button>
            </div>

            {/* Details */}
            <div className="space-y-4 rounded-lg bg-secondary/20 p-4 text-sm">
                <div className="flex gap-2">
                    <span className="font-semibold min-w-[80px]">Fabric:</span>
                    <span>{product.fabric}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold min-w-[80px]">Fit:</span>
                    <span>Regular Fit</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-semibold min-w-[80px]">Delivery:</span>
                    <span className="flex items-center gap-1 text-green-600">
                        <Truck className="h-3 w-3" /> Dispatched in 24 hours
                    </span>
                </div>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
            </div>
        </div>
    );
}
