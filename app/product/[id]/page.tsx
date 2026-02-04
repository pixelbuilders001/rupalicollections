import { getProductById } from "@/app/actions/product-actions";
import { getWishlistIdsAction } from "@/app/actions/wishlist-actions";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ReviewList } from "@/components/reviews/ReviewList";
import { notFound } from "next/navigation";
import { Product } from "@/lib/types";
import { Metadata } from "next";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    { params }: ProductPageProps
): Promise<Metadata> {
    const { id } = await params;
    const result = await getProductById(id);

    if (!result.success || !result.data) {
        return {
            title: "Product Not Found",
        };
    }

    const product = result.data;

    return {
        title: product.name,
        description: product.description?.slice(0, 160),
        openGraph: {
            title: product.name,
            description: product.description?.slice(0, 160),
            images: product.thumbnail_url ? [product.thumbnail_url] : [],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const result = await getProductById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const typedProduct = result.data;

    // Fetch wishlist status
    const wishlistResult = await getWishlistIdsAction();
    const isWishlisted = wishlistResult.success && wishlistResult.data
        ? wishlistResult.data.includes(typedProduct.id)
        : false;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
                <ProductGallery images={typedProduct.images} thumbnail={typedProduct.thumbnail_url} />
                <ProductInfo product={typedProduct} isWishlisted={isWishlisted} />
            </div>

            {/* Description Section */}
            {typedProduct.description && (
                <div className="mt-16 border-t pt-10">
                    <h2 className="font-serif text-2xl font-bold mb-4">Product Description</h2>
                    <div className="prose max-w-none text-muted-foreground whitespace-pre-line">
                        {typedProduct.description}
                    </div>
                </div>
            )}

            {/* Reviews Section */}
            <div className="mt-16 border-t pt-10">
                <h2 className="font-serif text-2xl font-bold mb-8">Customer Reviews</h2>
                <ReviewList productId={typedProduct.id} />
            </div>

            {/* Related Products Section */}
            <RelatedProducts
                categoryId={typedProduct.category_id}
                currentProductId={typedProduct.id}
            />
        </div>
    );
}

