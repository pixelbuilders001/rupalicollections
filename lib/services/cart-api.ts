import { createClient } from "@/lib/supabase/client";

const CART_API_URL = "https://ehdylnqmhqagxbzrzdig.supabase.co/functions/v1/quick-action";
const API_KEY = "sb_publishable_YcoICX0IdZ1";

export async function addToCartApi(productId: string, quantity: number = 1) {
    const supabase = createClient();

    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.warn("User not logged in, skipping Cart API call");
            return { success: false, error: "Not logged in" };
        }

        const userId = session.user.id;
        const authToken = session.access_token;

        const response = await fetch(CART_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": API_KEY,
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                user_id: userId,
                product_id: productId,
                quantity: quantity
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to add to cart via API");
        }

        return { success: true, data: await response.json() };
    } catch (error: any) {
        console.error("Cart API Error:", error.message);
        return { success: false, error: error.message };
    }
}
