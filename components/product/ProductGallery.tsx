"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted md:aspect-square">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative h-full w-full"
                    >
                        <Image
                            src={images[selectedImage]}
                            alt="Product Image"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
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
        </div>
    );
}
