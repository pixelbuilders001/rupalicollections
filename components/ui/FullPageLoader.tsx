"use client";

import { motion } from "framer-motion";

export function FullPageLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="relative">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent"
                />
                {/* Inner Dot */}
                <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-primary"
                />
            </div>
        </div>
    );
}

export default FullPageLoader;
