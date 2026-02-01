import { products } from "@/lib/data";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params; // Next.js 15+ params are promises? Actually Next 15 yes, Next 14 maybe no.
    // The user said Next.js latest (16.1.6). In Next 15/16 params are Promises.

    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
                <ProductGallery images={product.images} />
                <ProductInfo product={product} />
            </div>
        </div>
    );
}
