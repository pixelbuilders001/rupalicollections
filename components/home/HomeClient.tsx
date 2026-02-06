"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Truck, RefreshCw, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { categories as fallbackCategories } from "@/lib/data";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { getCategories, getTrendingProducts, getNewArrivals, getHeroBanners } from "@/app/actions/product-actions";
import { useStore } from "@/lib/store";
import { PWAInstallBanner } from "@/components/common/PWAInstallBanner";
import { HeroCarousel } from "./HeroCarousel";

export function HomeClient() {
    const [categories, setCategories] = useState<any[]>(fallbackCategories);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [bannersLoading, setBannersLoading] = useState(true);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const [categoriesRes, trendingRes, arrivalsRes, bannersRes] = await Promise.all([
                    getCategories(),
                    getTrendingProducts(4),
                    getNewArrivals(6),
                    getHeroBanners()
                ]);

                if (categoriesRes.success && categoriesRes.data) {
                    setCategories(categoriesRes.data);
                }

                if (trendingRes.success && trendingRes.data) {
                    setTrendingProducts(trendingRes.data);
                }

                if (arrivalsRes.success && arrivalsRes.data) {
                    setNewArrivals(arrivalsRes.data);
                }

                if (bannersRes.success && bannersRes.data) {
                    setBanners(bannersRes.data);
                }
            } catch (err) {
                console.error("Error loading home data:", err);
            } finally {
                setCategoriesLoading(false);
                setProductsLoading(false);
                setBannersLoading(false);
            }
        };

        loadHomeData();
    }, []);

    return (
        <div className="flex flex-col gap-8 pb-10 bg-background">
            {/* Search Bar - App Style (Sticky or Top) */}
            <div className="px-4 pt-2 -mb-4 md:hidden">
                <div
                    onClick={() => useStore.getState().setIsSearchOpen(true)}
                    className="flex items-center gap-3 rounded-2xl bg-secondary/40 px-5 py-3.5 text-muted-foreground/60 border border-border/40 active:scale-[0.98] transition-all cursor-text shadow-sm"
                >
                    <Search className="h-4.5 w-4.5 text-primary/60" />
                    <span className="text-sm font-medium">Search sarees, kurtis, silk...</span>
                </div>
            </div>

            {/* Hero Carousel */}
            {banners.length > 0 ? (
                <HeroCarousel banners={banners} />
            ) : !bannersLoading ? (
                <section className="px-4">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted md:aspect-[21/9]">
                        <Image
                            src="https://plus.unsplash.com/premium_photo-1682090811844-e0a89fb2c780?q=80&w=1170&auto=format&fit=crop"
                            alt="New Season Collection - Premium Indian Ethnic Wear"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/80">New Season</span>
                                <h1 className="mt-1 font-serif text-2xl font-bold md:text-4xl">
                                    Spring / Summer <br /> '24 Collection
                                </h1>
                                <Link href="/shop" className="mt-4 block w-fit">
                                    <Button size="sm" className="h-8 rounded-full bg-white px-4 text-[11px] font-bold text-black hover:bg-white/90">
                                        EXPLORE NOW
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="px-4">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-background md:aspect-[21/9]" />
                </div>
            )}

            {/* Categories - Story Style (Circle Icons) */}
            <section className="px-4">
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {categoriesLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0">
                                <div className="h-[64px] w-[64px] rounded-full bg-secondary/50 animate-pulse" />
                                <div className="h-2 w-10 bg-secondary/50 animate-pulse rounded" />
                            </div>
                        ))
                    ) : (
                        categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/shop?category=${category.slug}`}
                                className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0 snap-start"
                            >
                                <div className="relative h-[66px] w-[66px] overflow-hidden rounded-full border-2 border-primary/20 p-0.5 transition-transform active:scale-95">
                                    <div className="relative h-full w-full overflow-hidden rounded-full">
                                        <Image
                                            src={category.image}
                                            alt={`${category.name} Collection`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <span className="text-[11px] font-medium text-foreground/80">{category.name}</span>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* Trending Now - Tighter Grid */}
            <section className="px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Trending Now</h2>
                    <Link href="/shop" className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        View All
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {productsLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] animate-pulse rounded-md bg-secondary/30" />)
                    ) : trendingProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Promotional Card / Middle Banner */}
            <section className="px-4">
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-primary/10">
                    <div className="flex h-full items-center justify-between px-8">
                        <div className="max-w-[180px]">
                            <span className="text-[10px] font-bold text-primary uppercase">Special Offer</span>
                            <h3 className="mt-1 font-serif text-xl font-bold leading-tight">Handcrafted Luxury Kurtis</h3>
                            <p className="mt-1 text-xs text-muted-foreground">FLAT 20% OFF today</p>
                        </div>
                        <div className="relative h-32 w-24 overflow-hidden rounded-lg shadow-xl shadow-primary/20 rotate-6">
                            <Image src="/hero-image.png" alt="Promo Banner - Rupali Collection" fill className="object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">New Arrivals</h2>
                    <Link href="/shop" className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        View All
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-6">
                    {productsLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] animate-pulse rounded-md bg-secondary/30" />)
                    ) : newArrivals.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            <div className="px-4">
                <PWAInstallBanner />
            </div>

            {/* Service Highlights - Minimal */}
            <section className="mx-4 mt-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-8 pb-4">
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50">
                        <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50">
                        <RefreshCw className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold">7-Day Returns</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold">100% Secure</span>
                </div>
            </section>
        </div>
    );
}
