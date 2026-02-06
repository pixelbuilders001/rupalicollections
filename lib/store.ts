import { create } from "zustand";
import { persist } from "zustand/middleware";
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
    setWishlistItems: (items: Product[]) => void;
    cartTotal: () => number;
    cartCount: () => number;
    wishlistCount: () => number;
    serviceablePincode: string | null;
    serviceableCity: string | null;
    serviceableState: string | null;
    isLoggedIn: boolean;
    isSearchOpen: boolean;
    isDesktopSearchOpen: boolean;
    userProfile: { name: string; avatar_url: string | null } | null;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    setIsSearchOpen: (isOpen: boolean) => void;
    setIsDesktopSearchOpen: (isOpen: boolean) => void;
    setUserProfile: (profile: { name: string; avatar_url: string | null } | null) => void;
    setServiceablePincode: (pincode: string | null, city?: string | null, state?: string | null) => void;
}

export const useStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            wishlist: [],
            isLoggedIn: false,
            isSearchOpen: false,
            isDesktopSearchOpen: false,
            userProfile: null,
            setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn, userProfile: isLoggedIn ? get().userProfile : null }),
            setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
            setIsDesktopSearchOpen: (isDesktopSearchOpen) => set({ isDesktopSearchOpen }),
            setUserProfile: (userProfile) => set({ userProfile }),
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
            clearCart: () => set({
                items: [],
                serviceablePincode: null,
                serviceableCity: null,
                serviceableState: null
            }),
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
            setWishlistItems: (items) => {
                const uniqueItems = Array.from(new Map(items.map(item => [item.id, item])).values());
                set({ wishlist: uniqueItems });
            },
            cartTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
            cartCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
            wishlistCount: () => {
                return get().wishlist.length;
            },
            serviceablePincode: null,
            serviceableCity: null,
            serviceableState: null,
            setServiceablePincode: (pincode, city = null, state = null) =>
                set({ serviceablePincode: pincode, serviceableCity: city, serviceableState: state }),
        }),
        {
            name: "rupalicollection-storage",
            partialize: (state) => ({
                items: state.isLoggedIn ? [] : state.items, // Only persist items for guests
                wishlist: state.wishlist,
                serviceablePincode: state.serviceablePincode,
                serviceableCity: state.serviceableCity,
                serviceableState: state.serviceableState,
            }),
            // On hydration, we can't easily check auth here because it's async,
            // but we can ensure that when the user logs in, the components 
            // will trigger a fetch and overwrite these items.
        }
    )
);
