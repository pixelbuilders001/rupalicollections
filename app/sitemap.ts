import { MetadataRoute } from 'next';
import { getProducts } from '@/app/actions/product-actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://rupalicollection.com';

    // Static routes
    const routes = [
        '',
        '/shop',
        '/cart',
        '/wishlist',
        '/account',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic product routes
    try {
        const productsResult = await getProducts({});
        if (productsResult.success && productsResult.data) {
            const productRoutes = productsResult.data.map((product) => ({
                url: `${baseUrl}/product/${product.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
            return [...routes, ...productRoutes];
        }
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return routes;
}
