import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "sonner";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { ScrollToTop } from "@/components/common/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rupalicollection.com"),
  title: {
    default: "Rupali Collection | Elegant Indian Fashion - Sarees, Kurtis & Lehengas",
    template: "%s | Rupali Collection"
  },
  description: "Experience the elegance of traditional Indian fashion. Shop the latest collection of premium Sarees, Designer Kurtis, and Bridal Lehengas at Rupali Collection. Worldwide shipping available.",
  keywords: ["Indian Fashion", "Sarees", "Kurtis", "Lehengas", "Designer Ethnic Wear", "Rupali Collection", "Online Saree Shopping"],
  authors: [{ name: "Rupali Collection" }],
  creator: "Rupali Collection",
  publisher: "Rupali Collection",
  appleWebApp: {
    capable: true,
    title: "Rupali Collection",
    statusBarStyle: "default",
  },
  applicationName: "Rupali Collection",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://rupalicollection.com",
    siteName: "Rupali Collection",
    title: "Rupali Collection | Premium Indian Ethnic Wear",
    description: "Discover the finest collection of Sarees, Kurtis, and Lehengas. Elegant designs forEvery occasion.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rupali Collection - Elegant Indian Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rupali Collection | Elegant Indian Fashion",
    description: "Shop the latest collection of premium Indian Ethnic Wear.",
    images: ["/og-image.jpg"],
    creator: "@rupalicollection",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "fashion",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFAFA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorantGaramond.variable} antialiased bg-background text-foreground`}
      >
        <Toaster position="top-center" richColors />
        <LoadingProvider>
          <ScrollToTop />
          <Navbar />
          <main className="min-h-screen pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </LoadingProvider>
      </body>
    </html>
  );
}
