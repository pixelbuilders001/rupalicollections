'use server'

import { createClient } from '@/lib/supabase/server';
import { ProductReview } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function submitReview(data: {
    product_id: string;
    order_id: string;
    order_item_id: string;
    rating: number;
    title: string;
    review: string;
}) {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: 'You must be logged in to submit a review' };
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('order_item_id', data.order_item_id)
        .single();

    let result;

    if (existingReview) {
        // Update existing review
        result = await supabase
            .from('product_reviews')
            .update({
                rating: data.rating,
                title: data.title,
                review: data.review,
                status: 'pending', // Reset status to pending on update
                updated_at: new Date().toISOString()
            })
            .eq('id', existingReview.id)
            .select()
            .single();
    } else {
        // Insert new review
        result = await supabase
            .from('product_reviews')
            .insert({
                product_id: data.product_id,
                order_id: data.order_id,
                order_item_id: data.order_item_id,
                user_id: user.id,
                rating: data.rating,
                title: data.title,
                review: data.review,
                status: 'pending'
            })
            .select()
            .single();
    }

    if (result.error) {
        console.error('Error submitting review:', result.error);
        return { error: 'Failed to submit review. Please try again.' };
    }

    revalidatePath(`/product/${data.product_id}`);

    return { success: true, review: result.data };
}

export async function getProductReviews(productId: string) {
    const supabase = await createClient();
    const query = supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved');

    const { data: reviews, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    // Fetch user profiles manually since relation might be missing
    const userIds = Array.from(new Set(reviews?.map(r => r.user_id) || []));
    let profiles: any[] = [];

    if (userIds.length > 0) {
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, profile_image, avatar_url')
            .in('id', userIds);
        profiles = profilesData || [];
    }

    const reviewsWithUser = reviews?.map(review => {
        const profile = profiles.find(p => p.id === review.user_id);
        return {
            ...review,
            user: {
                full_name: profile?.full_name || 'Anonymous',
                avatar_url: profile?.profile_image || profile?.avatar_url || ''
            }
        };
    });

    return reviewsWithUser as ProductReview[];
}

export async function getCurrentUserId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

export async function getUserReviews() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching user reviews:', error);
        return [];
    }

    return reviews as ProductReview[];
}
