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
            <div className="relative aspect-[4/5] md:aspect-[3/4] max-h-[60vh] md:max-h-none w-full overflow-hidden rounded-2xl md:rounded-2xl bg-secondary/5">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-zoom-in"
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

                {/* Overlay Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-primary shadow-sm">New Season</span>
                </div>

                {/* Mobile Pagination Pills */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
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

                {/* Desktop Arrows */}
                <button
                    onClick={() => scrollToImage(Math.max(0, selectedImage - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-foreground hidden md:flex shadow-lg"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={() => scrollToImage(Math.min(displayImages.length - 1, selectedImage + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-all hover:bg-white text-foreground hidden md:flex shadow-lg"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
                <div className="flex gap-2 px-4 md:px-0 overflow-x-auto no-scrollbar py-2">
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
