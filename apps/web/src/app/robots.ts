import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://espresso.app';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/', '/settings/', '/history/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
