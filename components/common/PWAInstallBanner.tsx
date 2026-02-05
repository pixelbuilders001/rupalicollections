"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePWAInstall } from "@/lib/hooks/usePWAInstall";
import { useEffect, useState } from "react";

export function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIpad = userAgent.includes('ipad');
        const isIphone = userAgent.includes('iphone');
        setIsIOS(isIpad || isIphone);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            setIsInstalled(true);
        } else {
            // Decided visibility - show if not installed and not recently dismissed
            const isDismissed = sessionStorage.getItem("pwa-banner-dismissed");
            if (!isDismissed) {
                setIsVisible(true);
            }
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsVisible(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (isIOS) {
                alert("To install: Tap the share button below and select 'Add to Home Screen' 📲");
            } else {
                alert("To install: Open your browser menu (⋮ or ⋯) and select 'Install app' or 'Add to home screen'");
            }
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("pwa-banner-dismissed", "true");
    };

    if (isInstalled || !isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-2"
        >
            <div className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-primary/5 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-white shadow-inner">
                            <Image
                                src="/icon.png"
                                alt="Rupali App Icon"
                                fill
                                className="object-cover p-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-serif text-[14px] font-black leading-tight text-foreground">
                                {isIOS ? 'Add Rupali to Home' : 'Install Rupali App'}
                            </h4>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-tight">
                                {isIOS ? 'Tap Share > Add to Home Screen' : 'Shop faster & save data'}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleInstallClick}
                        size="sm"
                        className="h-9 px-6 rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-[0.97] transition-all"
                    >
                        Install
                    </Button>
                </div>

                {/* Subtle App Bar Branding */}
                <div className="absolute -bottom-1 -left-1 -right-1 h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 opacity-30" />
            </div>
        </motion.div>
    );
}
