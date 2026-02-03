const QUICK_ACTION_URL = "https://ehdylnqmhqagxbzrzdig.supabase.co/functions/v1/quick-action";
const GET_CART_URL = "https://ehdylnqmhqagxbzrzdig.supabase.co/functions/v1/get-cart";
const API_KEY = "sb_publishable_YcoICX0IdZ1";

export async function addToCartApi(productId: string, quantity: number = 1, authToken: string) {
    try {
        if (!authToken) {
            console.warn("No auth token provided for Cart API call");
            return { success: false, error: "Not logged in" };
        }

        const response = await fetch(QUICK_ACTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": API_KEY,
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                product_id: productId,
                qty: quantity
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add to cart via API");
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        console.error("Add to Cart API Error:", error.message);
        return { success: false, error: error.message };
    }
}

export async function getCartApi(authToken: string) {
    try {
        if (!authToken) {
            return { success: false, error: "Not logged in" };
        }

        const response = await fetch(GET_CART_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": API_KEY,
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch cart via API");
        }

        const responseData = await response.json();
        // Handle common Supabase Edge Function response formats where data might be nested
        const data = responseData.data || responseData;
        return { success: true, data };
    } catch (error: any) {
        console.error("Get Cart API Error:", error.message);
        return { success: false, error: error.message };
    }
}
