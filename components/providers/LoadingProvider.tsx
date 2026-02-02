"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FullPageLoader } from "@/components/ui/FullPageLoader";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Show loader on pathname change
        setIsLoading(true);

        // Minimum duration for the brand loader to ensure visibility
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            {isLoading && <FullPageLoader />}
            {children}
        </>
    );
}
