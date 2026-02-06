"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/lib/types";

interface HeroCarouselProps {
    banners: HeroBanner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }, [banners.length]);

    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, banners?.length]);

    if (!banners || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <section className="px-4 relative group">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl md:aspect-[21/9]">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentBanner.id}
                        custom={direction}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: { duration: 0.8, ease: "easeInOut" }
                        }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Desktop Image */}
                        <div className={`${currentBanner.mobile_image_url ? 'hidden md:block' : 'block'} relative w-full h-full`}>
                            <Image
                                src={currentBanner.image_url}
                                alt={currentBanner.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Mobile Image */}
                        {currentBanner.mobile_image_url && (
                            <div className="block md:hidden relative w-full h-full">
                                <Image
                                    src={currentBanner.mobile_image_url}
                                    alt={currentBanner.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

                        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 text-white">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/80">
                                    {currentBanner.subtitle || "New Season"}
                                </span>
                                <h1 className="mt-1 font-serif text-2xl font-bold md:text-5xl lg:text-6xl max-w-2xl leading-tight">
                                    {currentBanner.title}
                                </h1>

                                {currentBanner.cta_text && (
                                    <Link href={currentBanner.cta_link || "/shop"} className="mt-6 block w-fit">
                                        <Button size="lg" className="h-10 md:h-12 rounded-full bg-white px-6 md:px-8 text-xs md:text-sm font-bold text-black hover:bg-white/90">
                                            {currentBanner.cta_text.toUpperCase()}
                                        </Button>
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {banners.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:block"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 hidden md:block"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentIndex ? 1 : -1);
                                        setCurrentIndex(index);
                                    }}
                                    className={`h-1.5 rounded-full transition-all ${index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
