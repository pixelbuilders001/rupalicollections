"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function FullPageLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                {/* Rotating Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute h-32 w-32 rounded-full border-t-2 border-primary"
                />

                {/* Secondary Ring (Opposite direction) */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute h-28 w-28 rounded-full border-b border-primary/30"
                />

                {/* Pulsing Logo Container */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.05, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative h-20 w-20 overflow-hidden rounded-full border border-primary/20 bg-white p-2 shadow-xl"
                >
                    <div className="relative h-full w-full">
                        <Image
                            src="/logo.png"
                            alt="Rupali Collection"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </motion.div>
            </div>

            {/* Brand Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
            >
                <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                    Rupali Collection
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Indian Elegance
                </p>

                {/* Loading indicator line */}
                <div className="mt-6 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="h-1 w-1 rounded-full bg-primary"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default FullPageLoader;
