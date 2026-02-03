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
  title: "Rupali Collection | Elegant Indian Fashion",
  description: "Discover the finest collection of Sarees, Kurtis, and Lehengas.",
  applicationName: "Rupali Collection",
  appleWebApp: {
    capable: true,
    title: "Rupali Collection",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
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
