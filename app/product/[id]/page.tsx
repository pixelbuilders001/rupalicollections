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
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-0 md:px-4 md:py-8">
                <div className="grid gap-0 md:gap-12 lg:gap-20 md:grid-cols-2">
                    <div className="w-full">
                        <ProductGallery images={typedProduct.images} thumbnail={typedProduct.thumbnail_url} />
                    </div>

                    <div className="px-5 pt-4 md:px-0 md:pt-0">
                        <ProductInfo product={typedProduct} isWishlisted={isWishlisted} />
                    </div>
                </div>

                {/* Description Section */}
                {typedProduct.description && (
                    <div className="mt-12 border-t border-secondary/20 pt-12 px-5 md:px-0">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="font-serif text-xl font-black uppercase tracking-tight">Style Notes</h2>
                            <div className="h-px flex-1 bg-secondary/10" />
                        </div>
                        <div className="prose prose-sm max-w-none text-muted-foreground/80 leading-relaxed font-medium whitespace-pre-line">
                            {typedProduct.description}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-16 border-t border-secondary/20 pt-16 px-5 md:px-0">
                    <div className="flex items-center gap-3 mb-10">
                        <h2 className="font-serif text-xl font-black uppercase tracking-tight">The Verdict</h2>
                        <div className="h-px flex-1 bg-secondary/10" />
                    </div>
                    <ReviewList productId={typedProduct.id} />
                </div>

                {/* Related Products Section */}
                <div className="mt-20 border-t border-secondary/20 pt-20 pb-20 md:pb-0 px-5 md:px-0">
                    <RelatedProducts
                        categoryId={typedProduct.category_id}
                        currentProductId={typedProduct.id}
                    />
                </div>
            </div>
        </div>
    );
}

