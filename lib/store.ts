import { create } from "zustand";
import { Product, CartItem } from "./types";

interface CartState {
    items: CartItem[];
    wishlist: Product[];
    addToCart: (product: Product, quantity: number, size: string, color?: string) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    setCartItems: (items: CartItem[]) => void;
    cartTotal: () => number;
    cartCount: () => number;
}

export const useStore = create<CartState>()((set, get) => ({
    items: [],
    wishlist: [],
    addToCart: (product, quantity, size, color) => {
        const cartId = `${product.id}-${size}-${color || "default"}`;

        set((state) => {
            const existingItem = state.items.find((item) => item.cartId === cartId);
            if (existingItem) {
                return {
                    items: state.items.map((item) =>
                        item.cartId === cartId
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            }
            return {
                items: [
                    ...state.items,
                    { ...product, cartId, quantity, selectedSize: size, selectedColor: color },
                ],
            };
        });
    },
    removeFromCart: (cartId) => {
        set((state) => ({
            items: state.items.filter((item) => item.cartId !== cartId),
        }));
    },
    updateQuantity: (cartId, quantity) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.cartId === cartId ? { ...item, quantity: Math.max(1, quantity) } : item
            ),
        }));
    },
    clearCart: () => set({ items: [] }),
    addToWishlist: (product) => {
        set((state) => {
            if (state.wishlist.some((item) => item.id === product.id)) return state;
            return { wishlist: [...state.wishlist, product] };
        });
    },
    removeFromWishlist: (productId) => {
        set((state) => ({
            wishlist: state.wishlist.filter((item) => item.id !== productId),
        }));
    },
    isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
    },
    setCartItems: (items) => set({ items }),
    cartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    cartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}));
