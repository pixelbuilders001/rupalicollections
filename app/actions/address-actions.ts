"use server";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Address[] };
}

export async function saveAddress(address: Partial<Address>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // If this is set as default, we need to unset others first
    if (address.is_default) {
        await supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);
    }

    const { id, ...addressDataWithoutId } = address;
    const finalData = {
        ...addressDataWithoutId,
        user_id: user.id,
        updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
        // Update
        result = await supabase
            .from("addresses")
            .update(finalData)
            .eq("id", id)
            .eq("user_id", user.id);
    } else {
        // Insert
        result = await supabase
            .from("addresses")
            .insert(finalData);
    }

    if (result.error) return { success: false, error: result.error.message };

    revalidatePath("/addresses");
    return { success: true };
}

export async function deleteAddress(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/addresses");
    return { success: true };
}

export async function setDefaultAddress(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Unset all current defaults
    const { error: unsetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

    if (unsetError) return { success: false, error: unsetError.message };

    // 2. Set the new default
    const { error: setError } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

    if (setError) return { success: false, error: setError.message };

    revalidatePath("/addresses");
    return { success: true };
}
