"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
    images?: string[];
    thumbnail?: string;
}

export function ProductGallery({ images = [], thumbnail }: ProductGalleryProps) {
    const displayImages = images.length > 0 ? images : (thumbnail ? [thumbnail] : []);
    const [selectedImage, setSelectedImage] = useState(0);

    if (displayImages.length === 0) {
        return <div className="aspect-[3/4] w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground">No Image Available</div>;
    }

    return (
        <div className="relative flex flex-col gap-3">
            {/* Main Image - Snap Carousel on Mobile */}
            <div className="relative aspect-[3/4] w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-0 rounded-lg bg-muted">
                {displayImages.map((img, index) => (
                    <div key={index} className="relative h-full w-full flex-shrink-0 snap-center">
                        <Image
                            src={img}
                            alt={`Product Image ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Pagination Dots - Mobile Overlay Style */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/10 px-2 py-1 backdrop-blur-sm">
                {displayImages.map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all duration-300",
                            selectedImage === index ? "bg-white w-3" : "bg-white/50"
                        )}
                        // Note: For actual swipe detection, would need a library or more complex hook.
                        // Here we just keep the dots for UI reference or simple click.
                        onClick={() => {
                            const el = document.querySelector('.snap-x');
                            if (el) {
                                el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
                                setSelectedImage(index);
                            }
                        }}
                    />
                ))}
            </div>

            {/* Thumbnails - Hidden on mobile, visible on desktop */}
            {displayImages.length > 1 && (
                <div className="hidden md:flex gap-4 overflow-x-auto pb-2">
                    {displayImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={cn(
                                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                                selectedImage === index ? "border-primary" : "border-transparent"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Product thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
