export function JsonLd() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://espresso.app';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Espresso',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: 'Fix your photos with AI. Perfect eye contact, posture, and lighting in seconds.',
        url: baseUrl,
        author: {
            '@type': 'Organization',
            name: 'Espresso',
            url: baseUrl,
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '1250',
        },
        featureList: [
            'AI Eye Contact Correction',
            'Posture Improvement',
            'Lighting Enhancement',
            'Angle Adjustment'
        ],
        screenshot: `${baseUrl}/og-image.jpg`,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
