"use server"

import { createClient } from "@/lib/supabase/server";

export async function addToWishlistAction(productId: string) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const response = await fetch('https://ehdylnqmhqagxbzrzdig.supabase.co/functions/v1/add-wishlist', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add to wishlist');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error("Add to wishlist error:", error);
        return { success: false, error: error.message || "Failed to add to wishlist" };
    }
}

export async function getWishlistAction() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const { data, error } = await supabase
            .from('wishlists')
            .select(`
                id,
                product:products (*)
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten the structure to return an array of products
        const products = data.map((item: any) => item.product).filter((p: any) => p !== null);

        return { success: true, data: products };
    } catch (error: any) {
        console.error("Get wishlist error:", error);
        return { success: false, error: error.message || "Failed to fetch wishlist" };
    }
}

export async function getWishlistIdsAction() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: true, data: [] }; // Return empty if not logged in

        const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', session.user.id);

        if (error) throw error;

        const ids = data.map((item: any) => item.product_id);
        return { success: true, data: ids };
    } catch (error: any) {
        console.error("Get wishlist ids error:", error);
        return { success: false, error: error.message || "Failed to fetch wishlist ids" };
    }
}

export async function removeFromWishlistAction(productId: string) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Remove from wishlist error:", error);
        return { success: false, error: error.message || "Failed to remove from wishlist" };
    }
}
