"use server";

import { createClient } from "@/lib/supabase/server";
import { clearUserCartAction } from "./cart-actions";

export async function confirmOrderAction(payload: {
    name: string;
    phone: string;
    address: string;
    amount: number;
    payment_method: string;
}) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        // Get the access token if available, otherwise fallback to anon key (though for orders, session is preferred)
        const token = session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const response = await fetch('https://ehdylnqmhqagxbzrzdig.supabase.co/functions/v1/confirm-order', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to confirm order');
        }

        const data = await response.json();

        // Clear the cart from the database after success
        await clearUserCartAction();

        return { success: true, data };
    } catch (error: any) {
        console.error("Order confirmation error:", error);
        return { success: false, error: error.message || "Failed to place order" };
    }
}

export async function getOrdersAction() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_code,
                items:order_items(
                    *,
                    product:products(*)
                ),
                history:order_history(*)
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, data: orders };
    } catch (error: any) {
        console.error("Fetch orders error:", error);
        return { success: false, error: error.message || "Failed to fetch orders" };
    }
}

export async function cancelOrderAction(orderId: string) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { success: false, error: "Not logged in" };

        const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('user_id', session.user.id)
            .eq('status', 'pending');

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Cancel order error:", error);
        return { success: false, error: error.message || "Failed to cancel order" };
    }
}
