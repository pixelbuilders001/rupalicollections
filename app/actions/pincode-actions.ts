"use server"

import { createClient } from "@/lib/supabase/server";

export async function checkServiceabilityAction(pincode: string) {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
        return { success: false, error: "Please enter a valid 6-digit pincode" };
    }

    try {
        // 1. Fetch data from external API
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (!data || data[0].Status === "Error") {
            return { success: false, error: "Invalid pincode or data not found" };
        }

        const district = data[0].PostOffice[0].District;
        const stateName = data[0].PostOffice[0].State;

        // 2. Cross-reference with our database
        const supabase = await createClient();
        const { data: serviceable, error } = await supabase
            .from('serviceable_pincodes')
            .select('*')
            .ilike('city', district)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error("Database error checking serviceability:", error);
            // If DB check fails, we might want to be safe and say not serviceable or handle differently
            return { success: false, error: "Unable to verify serviceability at this time" };
        }

        if (serviceable) {
            return {
                success: true,
                serviceable: true,
                city: district,
                state: stateName,
                message: `Great! We deliver to ${district}`
            };
        } else {
            return {
                success: true,
                serviceable: false,
                city: district,
                state: stateName,
                message: `Sorry, we don't deliver to ${district} yet.`
            };
        }

    } catch (err) {
        console.error("Pincode API error:", err);
        return { success: false, error: "Service unreachable. Please try later." };
    }
}
