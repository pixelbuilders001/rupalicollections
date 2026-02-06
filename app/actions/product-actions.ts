"use server"

import { createClient } from "@/lib/supabase/server";
import { Product, HeroBanner, SortOption } from "@/lib/types";

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

    // First try to get featured products
    let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit);

    // Filter out error or empty data to fallback
    if (error || !data || data.length === 0) {
        // Fallback to most recent products if no featured ones
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (fallbackError) {
            console.error("Error fetching fallback trending products:", fallbackError);
            return { success: false, error: fallbackError.message };
        }
        data = fallbackData;
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

export async function getProducts(options: {
    categorySlug?: string | null,
    limit?: number,
    offset?: number,
    sortBy?: SortOption,
    minPrice?: number,
    maxPrice?: number
} = {}) {
    const {
        categorySlug,
        limit = 12,
        offset = 0,
        sortBy = "newest",
        minPrice = 0,
        maxPrice = 1000000
    } = options;

    const supabase = await createClient();

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .gte('price', minPrice)
        .lte('price', maxPrice);

    if (categorySlug) {
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

        if (catData) {
            query = query.eq('category_id', catData.id);
        }
    }

    // Apply Sorting
    switch (sortBy) {
        case "price-asc":
            query = query.order('price', { ascending: true });
            break;
        case "price-desc":
            query = query.order('price', { ascending: false });
            break;
        case "newest":
            query = query.order('created_at', { ascending: false });
            break;
        case "popularity":
            query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
            break;
        default:
            query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: data as Product[],
        totalCount: count || 0
    };
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
export async function searchProductsAction(query: string) {
    if (!query || query.trim().length === 0) {
        return { success: true, data: { products: [], categories: [] } };
    }

    const supabase = await createClient();
    const searchStr = `%${query}%`;

    try {
        // Search products: name, description, slug
        const { data: products, error: pError } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.${searchStr},description.ilike.${searchStr},slug.ilike.${searchStr}`)
            .eq('is_active', true)
            .limit(10);

        if (pError) throw pError;

        // Search categories: name, description, slug
        const { data: categories, error: cError } = await supabase
            .from('categories')
            .select('*')
            .or(`name.ilike.${searchStr},slug.ilike.${searchStr}`)
            .eq('is_active', true)
            .limit(5);

        if (cError) throw cError;

        return {
            success: true,
            data: {
                products: products || [],
                categories: categories || []
            }
        };
    } catch (error: any) {
        console.error("Search error:", error);
        return { success: false, error: error.message };
    }
}

export async function getHeroBanners() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

    if (error) {
        console.error("Error fetching hero banners:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as HeroBanner[] };
}
