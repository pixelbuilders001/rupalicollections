import { Suspense } from "react";
import { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { FullPageLoader } from "@/components/ui/FullPageLoader";

export const metadata: Metadata = {
    title: "Shop Collection | Premium Indian Ethnic Wear",
    description: "Browse our exclusive collection of Sarees, Kurtis, and Lehengas. Find the perfect outfit for weddings, festivals, and special occasions.",
    openGraph: {
        title: "Shop Indian Fashion Collection | Rupali Collection",
        description: "Discover premium Indian ethnic wear. Latest designs in Sarees, Kurtis, and more.",
        url: "https://rupalicollection.com/shop",
    },
    alternates: {
        canonical: "/shop",
    },
};

export default function ShopPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://rupalicollection.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop",
                "item": "https://rupalicollection.com/shop"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<FullPageLoader />}>
                <ShopClient />
            </Suspense>
        </>
    );
}
