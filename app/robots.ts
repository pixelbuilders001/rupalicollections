import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/checkout/', // Don't index checkout pages
                '/auth/',
                '/orders/',   // Private user pages
            ],
        },
        sitemap: 'https://rupalicollection.com/sitemap.xml',
    };
}
