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

export interface Address {
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Order {
    id: string;
    order_code: string;
    user_id: string;
    name: string;
    phone: string;
    address: string;
    amount: number;
    payment_method: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    items?: OrderItem[];
    history?: OrderHistoryItem[];
}

export interface OrderHistoryItem {
    id: string;
    order_id: string;
    order_item_id?: string; // Links to a specific item if applicable
    status: string;
    note?: string;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    qty: number;
    price: number;
    status?: 'created' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return_initiated';
    created_at: string;
    product?: Product;
    selectedSize?: string;
    selectedColor?: string;
}

export interface ProductReview {
    id: string;
    product_id: string;
    order_id: string;
    order_item_id: string;
    user_id: string;
    rating: number;
    title?: string;
    review?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    likes?: number;
    dislikes?: number;
    user?: {
        full_name: string;
        avatar_url?: string;
    };
}

export interface HeroBanner {
    id: string;
    title: string;
    subtitle?: string;
    image_url: string;
    mobile_image_url?: string;
    cta_text?: string;
    cta_link?: string;
    position: number;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

