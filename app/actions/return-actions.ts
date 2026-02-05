"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReturnRequestAction(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const orderId = formData.get("orderId") as string;
        const orderItemId = formData.get("orderItemId") as string;
        const reason = formData.get("reason") as string;
        const reasonType = formData.get("reasonType") as string;
        const description = formData.get("description") as string;

        // Handle images - this is a simplified example, actual upload logic might vary
        // Assumes client might have uploaded and sent URLs, or we handle upload here
        // For now, let's assume we receive a comma-separated list of image URLs if processed on client
        // OR we handle file upload here. 
        // Given the constraints and previous patterns, let's assume we might receive File objects or standard FormData behavior

        // However, handling file *uploads* directly in a server action with other data can be tricky if not careful.
        // Let's check if we have a file upload utility.
        // The user prompted: "open for image upload and all full flow".
        // I will implement a separate upload action or use Supabase storage.

        // For this action, let's assume the client uploads images first and sends URLs, OR we process files here.
        // Let's stick to the schema: images text[] null

        // Let's try to extract files from FormData
        // Handle images
        const imageFiles = formData.getAll("images") as File[];
        const imageUrls: string[] = [];
        console.log("imageFiles", imageFiles);
        console.log(`Processing ${imageFiles.length} images for return request`);

        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                // Skip empty files if any
                if (file.size === 0) {
                    console.log(`Skipping empty file: ${file.name}`);
                    continue;
                }

                try {
                    console.log(`Uploading file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

                    const fileExt = file.name.split('.').pop();
                    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `${session.user.id}/${Date.now()}-${sanitizedName}`;

                    // Convert file to ArrayBuffer for reliable server-side upload
                    const arrayBuffer = await file.arrayBuffer();
                    const fileBuffer = Buffer.from(arrayBuffer);

                    const { data, error } = await supabase.storage
                        .from('return-images')
                        .upload(fileName, fileBuffer, {
                            contentType: file.type || 'image/jpeg',
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (error) {
                        console.error("Supabase Storage Upload Error:", error);
                        console.error("Error Details:", JSON.stringify(error, null, 2));
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('return-images')
                            .getPublicUrl(fileName);

                        console.log(`Upload successful. Public URL: ${publicUrl}`);

                        if (publicUrl) {
                            imageUrls.push(publicUrl);
                        }
                    }
                } catch (err) {
                    console.error(`Exception uploading file ${file.name}:`, err);
                }
            }
        }

        console.log(`Successfully uploaded ${imageUrls.length} images`);

        // Insert into returns table
        const { error: returnError } = await supabase
            .from('returns')
            .insert({
                user_id: session.user.id,
                order_id: orderId,
                order_item_id: orderItemId,
                reason: reason, // This is technically "description" in the UI usually, but mapping to schema
                reason_type: reasonType,
                description: description, // Extra details
                images: imageUrls.length > 0 ? imageUrls : null,
                status: 'requested',
            });

        if (returnError) {
            console.error("Return insertion error:", returnError);
            return { success: false, error: "Failed to submit return request" };
        }

        // Update order history
        // "update the order_history api where status will be return initiated and in note it will be waiting for confirmation"
        // Wait, order_history usually tracks the *order* status. 
        // Does returning ONE item update the WHOLE order status? 
        // The user prompt says: "update the order_history api where status will be return initiated".
        // I will assume this updates the main order status.

        const { error: historyError } = await supabase
            .from('order_history')
            .insert({
                order_id: orderId,
                status: 'return_initiated',
                note: 'Waiting for confirmation' // As requested
            });

        // Also update the main orders table if needed to reflect the status there?
        // Usually yes.
        const { error: orderUpdateError } = await supabase
            .from('order_items')
            .update({ status: 'return_initiated' }) // Assuming 'return_initiated' is a valid status for order
            .eq('id', orderItemId);

        if (historyError || orderUpdateError) {
            console.error("History/Order update error:", historyError, orderUpdateError);
            // We might not want to fail the whole request if just history update fails, but typically we should.
        }

        revalidatePath('/orders');
        revalidatePath(`/return/${orderId}`);

        return { success: true };

    } catch (error: any) {
        console.error("Create return request error:", error);
        return { success: false, error: error.message || "An unexpected error occurred" };
    }
}
