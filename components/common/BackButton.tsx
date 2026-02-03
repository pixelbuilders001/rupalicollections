"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    className?: string;
    label?: string;
    variant?: "ghost" | "outline" | "default" | "secondary";
    showLabel?: boolean;
}

export function BackButton({ className, label = "Back", variant = "ghost", showLabel = false }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant={variant}
            size="sm"
            onClick={() => router.back()}
            className={cn(
                "gap-1 transition-all active:scale-95",
                variant === "ghost" && "h-10 w-10 p-0 rounded-full hover:bg-muted",
                className
            )}
        >
            <ChevronLeft className="h-5 w-5" />
            {(showLabel || label !== "Back") && <span className="text-sm font-medium">{label}</span>}
        </Button>
    );
}
