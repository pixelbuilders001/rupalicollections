"use server"

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order');

    if (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: error.message };
    }

    const mappedCategories = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image_url,
        slug: cat.slug
    }));

    return { success: true, data: mappedCategories };
}

export async function getTrendingProducts(limit = 4) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit);

    if (error) {
        console.error("Error fetching trending products:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Product[] };
}

export async function getNewArrivals(limit = 4) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching new arrivals:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Product[] };
}

export async function getRelatedProducts(categoryId: string, currentProductId: string, limit = 4) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .eq('is_active', true)
        .limit(limit);

    if (error) {
        console.error("Error fetching related products:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Product[] };
}

export async function getProducts(options: { categorySlug?: string | null } = {}) {
    const supabase = await createClient();
    let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

    if (options.categorySlug) {
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', options.categorySlug)
            .single();

        if (catData) {
            query = query.eq('category_id', catData.id);
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Product[] };
}

export async function getProductById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching product by id:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Product };
}
