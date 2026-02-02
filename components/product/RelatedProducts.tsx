import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/types";

interface RelatedProductsProps {
    categoryId: string;
    currentProductId: string;
}

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
    const supabase = await createClient();

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .eq('is_active', true)
        .limit(4);

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
