import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Espresso - AI Photo Enhancement',
        short_name: 'Espresso',
        description: 'Fix your photos with AI. Perfect eye contact, posture, and lighting in seconds.',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff',
        theme_color: '#2D4A3E',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
    };
}
