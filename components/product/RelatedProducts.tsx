import { getRelatedProducts } from "@/app/actions/product-actions";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/types";

interface RelatedProductsProps {
    categoryId: string;
    currentProductId: string;
}

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
    const result = await getRelatedProducts(categoryId, currentProductId);

    const products = result.success ? result.data : [];

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="mt-20">
            <h2 className="font-serif text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product as Product} />
                ))}
            </div>
        </section>
    );
}
