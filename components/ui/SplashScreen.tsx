"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SplashScreenProps {
    onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Animation sequence
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 3000); // 3 seconds splash

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFFCFA]"
        >
            <div className="relative flex flex-col items-center">
                {/* animated logo container */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1] // Custom ease
                    }}
                    className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 shadow-2xl"
                >
                    <Image
                        src="/logo.png"
                        alt="Rupali Collection"
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-center"
                >
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-[#1A1A1A]">
                        Rupali Collection
                    </h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "60px" }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mx-auto mt-2 h-0.5 bg-[#C5A059]"
                    />
                    <p className="mt-3 text-sm font-light uppercase tracking-[0.4em] text-[#8A8A8A]">
                        Timeless Elegance
                    </p>
                </motion.div>
            </div>

            {/* Bottom watermark */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-10"
            >
                {/* <div className="flex items-center gap-2 text-xs text-[#C5A059]/60">
                    <span className="h-px w-8 bg-current"></span>
                    <span>EST. 2024</span>
                    <span className="h-px w-8 bg-current"></span>
                </div> */}
            </motion.div>
        </motion.div>
    );
}
