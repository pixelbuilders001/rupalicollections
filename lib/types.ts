export type Category = "Sarees" | "Kurtis" | "Lehengas" | "Dresses" | "Co-ords";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    category: Category;
    sizes: string[];
    colors: string[];
    fabric: string;
    isNew?: boolean;
    isTrending?: boolean;
    rating: number;
    reviews: number;
    inStock: boolean;
}

export interface CartItem extends Product {
    cartId: string; // Unique ID for cart item (product + size + color combination)
    quantity: number;
    selectedSize: string;
    selectedColor?: string;
}

export type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";
