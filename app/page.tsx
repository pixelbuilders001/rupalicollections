import { HomeClient } from "@/components/home/HomeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rupali Collection | Elegant Indian Fashion - Sarees, Kurtis & Lehengas",
  description: "Shop the latest in Indian Ethnic Wear. Premium collection of Sarees, Kurtis, and Lehengas with worldwide shipping. Elevate your style with Rupali Collection.",
  openGraph: {
    title: "Rupali Collection | Elegant Indian Fashion",
    description: "Discover the finest collection of Sarees, Kurtis, and Lehengas.",
    url: "https://rupalicollection.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rupali Collection - Elegant Indian Fashion",
      },
    ],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Rupali Collection",
    "url": "https://rupalicollection.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rupalicollection.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rupali Collection",
    "url": "https://rupalicollection.com",
    "logo": "https://rupalicollection.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXXXXXXXXX",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://facebook.com/rupalicollection",
      "https://instagram.com/rupalicollection",
      "https://twitter.com/rupalicollection"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
