"use server"

import { createClient } from "@/lib/supabase/server";

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not logged in" };

    const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user profile:", error);
        return { success: false, error: error.message };
    }

    const profile = {
        id: user.id,
        email: user.email,
        name: profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Rupali Guest",
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
        phone: profileData?.phone_number || user.phone || user.user_metadata?.phone || ""
    };

    return { success: true, data: profile };
}

export async function updateUserProfile(updates: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not logged in" };

    const { error } = await supabase
        .from('profiles')
        .upsert({
            ...updates,
            id: user.id,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
