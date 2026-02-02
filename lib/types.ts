export type Category = "Sarees" | "Kurtis" | "Lehengas" | "Dresses" | "Apparel" | "Jhumkas" | "Women Apparel";

export interface DBCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url: string;
    is_active: boolean;
    order: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    sale_price?: number;
    currency: string;
    category_id: string;
    slug: string;
    thumbnail_url: string;
    images?: string[]; // Kept for frontend convenience if needed later
    is_active: boolean;
    is_featured: boolean;
    stock: number;
    sku?: string;
    // Previous frontend specific fields kept as optional for transitions
    sizes?: string[];
    colors?: string[];
    fabric?: string;
    rating?: number;
    reviews?: number;
}

export interface CartItem extends Product {
    cartId: string; // Unique ID for cart item (product + size + color combination)
    quantity: number;
    selectedSize: string;
    selectedColor?: string;
}

export type SortOption = "popularity" | "price-asc" | "price-desc" | "newest";
