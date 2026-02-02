"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/lib/data";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  const trendingProducts = products.filter((p) => p.isTrending);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden md:h-[80vh]">
        <Image
          src="/hero-image.png"
          alt="Elegant Indian Fashion"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl font-bold md:text-6xl lg:text-7xl"
          >
            Elegance in Every Weave
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-4 max-w-lg text-lg md:text-xl font-light"
          >
            Discover the finest collection of handcrafted Sarees, Kurtis, and Lehengas.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8"
          >
            <Button size="lg" className="rounded-full px-8 text-base bg-white text-black hover:bg-white/90">
              Shop Collection
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Carousel */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">Shop by Category</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="relative aspect-[3/4] min-w-[140px] flex-shrink-0 snap-start overflow-hidden rounded-lg md:min-w-[200px]"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <span className="font-medium text-lg">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">Trending Now</h2>
          <Link href="/shop" className="text-sm font-medium text-primary flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
          {trendingProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Feature Banner */}
      <section className="my-6 bg-secondary/30 py-12">
        <div className="container mx-auto grid grid-cols-3 gap-4 px-2 text-center md:flex md:flex-row md:text-left md:justify-around md:gap-6">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="rounded-full bg-primary/10 p-2 md:p-3">
              <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">Free Shipping</h3>
            <p className="hidden text-xs text-muted-foreground md:block">On all orders above ₹2999</p>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="rounded-full bg-primary/10 p-2 md:p-3">
              <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">Easy Returns</h3>
            <p className="hidden text-xs text-muted-foreground md:block">7-day hassle-free returns</p>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="rounded-full bg-primary/10 p-2 md:p-3">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm md:text-base">Secure Payment</h3>
            <p className="hidden text-xs text-muted-foreground md:block">100% secure checkout</p>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">New Arrivals</h2>
          <Link href="/shop" className="text-sm font-medium text-primary flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
