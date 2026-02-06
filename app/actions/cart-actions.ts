"use server";

import { createClient } from "@/lib/supabase/server";

import { addToCartApi, getCartApi } from "@/lib/services/cart-api";

/**
 * Adds a product to the cart using Supabase Edge Function.
 */
export async function addToCartServerAction(productId: string, quantity: number = 1, size: string = "One Size") {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return { success: false, error: "Not logged in" };
        }

        const result = await addToCartApi(productId, quantity, size, session.access_token);
        return result;
    } catch (error: any) {
        console.error("Add to cart error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Gets cart items using Supabase Edge Function.
 */
export async function getCartServerAction() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return { success: false, error: "Not logged in" };
        }

        const result = await getCartApi(session.access_token);
        return result;
    } catch (error: any) {
        console.error("Fetch cart error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Removes an item from the cart.
 */
export async function removeFromCartServerAction(cartItemId: string) {
    // Current requirement only provides quick-action (add) and get-cart.
    // If there's no specific remove API, we might need to handle this differently
    // or assume the user will provide one later. For now, I'll keep it as is
    // or mark as needing API.
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Remove from cart error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Updates the quantity of a cart item.
 */
export async function updateCartQuantityServerAction(cartItemId: string, quantity: number) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('cart_items')
            .update({ qty: quantity })
            .eq('id', cartItemId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Update cart quantity error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Completely clears the cart for the current user from the database.
 */
export async function clearUserCartAction() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const { error } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', session.user.id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Clear cart error:", error);
        return { success: false, error: error.message };
    }
}
