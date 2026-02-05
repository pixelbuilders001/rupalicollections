import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Rupali Collection | Elegant Indian Fashion',
        short_name: 'Rupali',
        description: 'Shop the latest in Indian Ethnic Wear. Premium collection of Sarees, Kurtis, and Lehengas.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FFFAFA',
        theme_color: '#FFFAFA',
        icons: [
            {
                src: '/favicon.ico',
                sizes: '64x64 32x32 24x24 16x16',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    };
}
