"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export function CartLoader() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
            <div className="relative">
                {/* Outer pulsing ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -inset-8 rounded-full bg-primary/20 blur-xl"
                />

                {/* Floating Cart Icon */}
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-2xl shadow-primary/20 border border-primary/5"
                >
                    <ShoppingBag className="h-10 w-10 text-primary" />

                    {/* Animated particles jumping into the bag */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [-20, -10],
                                x: [0, 0],
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.4,
                                ease: "easeOut",
                            }}
                            className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary"
                            style={{
                                left: `${40 + i * 10}%`,
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Loading Text */}
            <div className="mt-12 flex flex-col items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-foreground">Fetching your collection</h3>
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
