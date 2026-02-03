"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        // Standard window scroll
        window.scrollTo(0, 0);

        // Also handle potential body/main scroll issues
        document.documentElement.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        document.body.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
    }, [pathname]);

    return null;
}
