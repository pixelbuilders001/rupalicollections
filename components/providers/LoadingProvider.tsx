"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FullPageLoader } from "@/components/ui/FullPageLoader";
import { SplashScreen } from "@/components/ui/SplashScreen";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Show loader on pathname change, but not if splash is still showing
        if (!showSplash) {
            setIsLoading(true);
            const timer = setTimeout(() => setIsLoading(false), 800);
            return () => clearTimeout(timer);
        }
    }, [pathname, showSplash]);

    return (
        <>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            {isLoading && !showSplash && <FullPageLoader />}
            {children}
        </>
    );
}
