"use client";

import { useState, useEffect } from "react";

export function usePWAInstall() {
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

    return {
        deferredPrompt,
        isVisible,
        isInstalled,
        isIOS,
        handleInstallClick,
        handleDismiss
    };
}
