"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Gets or creates a cart ID for the current user.
 */
async function getOrCreateCart(supabase: any, userId: string) {
    const { data: cart, error } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (cart) return cart.id;

    const { data: newCart, error: insertError } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

    if (insertError) throw insertError;
    return newCart.id;
}

/**
 * Adds a product to the cart_items table using Supabase REST.
 */
export async function addToCartServerAction(productId: string, quantity: number = 1) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const cartId = await getOrCreateCart(supabase, session.user.id);

        // Get product price first
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('price, sale_price')
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        const price = product.sale_price || product.price;

        const { error } = await supabase
            .from('cart_items')
            .upsert({
                cart_id: cartId,
                product_id: productId,
                qty: quantity,
                price: price
            }, {
                onConflict: 'cart_id,product_id'
            });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Add to cart error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Gets cart items using Supabase REST with product join.
 */
export async function getCartServerAction() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const cartId = await getOrCreateCart(supabase, session.user.id);

        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                products (*)
            `)
            .eq('cart_id', cartId);

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error("Fetch cart error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Removes an item from the cart.
 */
export async function removeFromCartServerAction(cartItemId: string) {
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

        // Delete the cart record. CASCADE should handle cart_items if set up in SQL,
        // but we'll explicitly delete both to be safe or just delete the cart.
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
