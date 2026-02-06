"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ProductGalleryProps {
    images?: string[];
    thumbnail?: string;
    productName?: string;
}

export function ProductGallery({ images = [], thumbnail, productName = "Product" }: ProductGalleryProps) {
    const displayImages = images.length > 0 ? images : (thumbnail ? [thumbnail] : []);
    const [selectedImage, setSelectedImage] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
            setSelectedImage(index);
        }
    };

    const scrollToImage = (index: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: index * scrollRef.current.clientWidth,
                behavior: "smooth"
            });
            setSelectedImage(index);
        }
    };

    if (displayImages.length === 0) {
        return (
            <div className="aspect-[3/4] w-full rounded-2xl bg-secondary/5 flex items-center justify-center text-muted-foreground border border-dashed">
                No Image Available
            </div>
        );
    }

    return (
        <div className="relative group flex flex-col gap-4 px-4 md:px-0">
            {/* Main Image Container */}
            <div className="relative aspect-[4/5] md:aspect-auto md:h-auto w-full overflow-hidden rounded-2xl md:rounded-none bg-secondary/5 md:bg-transparent">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-zoom-in md:hidden"
                >
                    {displayImages.map((img, index) => (
                        <div key={index} className="relative h-full w-full flex-shrink-0 snap-center">
                            <Image
                                src={img}
                                alt={`${productName} - View ${index + 1} | Rupali Collection`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop Layout: Main Image + Thumbnails Below */}
                <div className="hidden md:flex md:flex-col gap-4 w-full max-w-[500px] mx-auto sticky top-24">
                    {/* Main Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary/5 shadow-sm border border-secondary/10">
                        <Image
                            src={displayImages[selectedImage]}
                            alt={`${productName} - View ${selectedImage + 1}`}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1200px) 40vw, 30vw"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/5">
                                New Season
                            </span>
                        </div>
                    </div>

                    {/* Horizontal Thumbnails for Desktop */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                        {displayImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={cn(
                                    "relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all hover:scale-105 active:scale-95",
                                    selectedImage === index
                                        ? "border-primary shadow-md ring-2 ring-primary/10"
                                        : "border-transparent opacity-60 hover:opacity-100 hover:border-secondary"
                                )}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overlay Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 md:hidden">
                    <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-primary shadow-sm">New Season</span>
                </div>

                {/* Mobile Pagination Pills */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full md:hidden">
                    {displayImages.map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "h-1 w-1 rounded-full transition-all duration-300",
                                selectedImage === index ? "bg-white w-4" : "bg-white/40"
                            )}
                        />
                    ))}
                </div>

                {/* Desktop Arrows (Hidden as we switched to grid) */}
                {/* 
                <button ... />
                <button ... />
             */}
            </div>

            {/* Thumbnails (Mobile Only) */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 px-4 md:px-0 overflow-x-auto no-scrollbar py-2 md:hidden">
                    {displayImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToImage(index)}
                            className={cn(
                                "relative aspect-[3/4] w-12 md:w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all active:scale-95",
                                selectedImage === index
                                    ? "border-primary shadow-lg ring-2 ring-primary/10"
                                    : "border-transparent opacity-60 hover:opacity-100 scale-95"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
