"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";
import { getURL } from "@/lib/utils";

export default function LoginPage() {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/';

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${getURL()}auth/callback?next=${encodeURIComponent(returnTo)}`,
            },
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -60, 0],
                        x: [0, -40, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/30 blur-[130px]"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 w-full max-w-[440px]"
            >
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/60 p-8 shadow-[0_32px_64px_-16px_rgba(197,160,89,0.15)] backdrop-blur-3xl md:p-12">
                    {/* Subtle border glow effect */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="mb-12 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="group relative mb-8"
                        >
                            <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 bg-white shadow-xl">
                                <Image
                                    src="/logo.png"
                                    alt="Rupali Collection"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            {/* <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground mb-2">
                                Rupali Collection
                            </h1> */}
                            <div className="h-0.5 w-12 bg-primary/30 mx-auto mb-4 rounded-full" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
                                Premium Indian Heritage
                            </p>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="text-center"
                        >
                            {/* <h2 className="text-2xl font-serif font-bold text-foreground/90">Welcome Back</h2> */}
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Sign in to discover our latest curated <br className="hidden sm:block" /> ethnic collections.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="outline"
                                type="button"
                                className="group relative h-16 w-full overflow-hidden rounded-2xl border-white/60 bg-white px-8 text-base shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] transition-all hover:bg-white/100 hover:shadow-[0_12px_24px_-8px_rgba(197,160,89,0.2)]"
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading}
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isGoogleLoading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : (
                                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                    )}
                                    <span className="font-bold text-foreground/80 tracking-tight">Continue with Google</span>
                                </div>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="text-center"
                        >
                            <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed uppercase tracking-wider">
                                By continuing, you agree to our <br />
                                <a href="/terms" className="text-primary/70 hover:text-primary transition-colors">Terms of Service</a> & <a href="/privacy" className="text-primary/70 hover:text-primary transition-colors">Privacy Policy</a>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Branding background text */}
            <div className="absolute bottom-10 left-10 pointer-events-none opacity-[0.03] select-none hidden lg:block">
                <h3 className="font-serif text-[12vw] font-black leading-none uppercase tracking-tighter">
                    Heritage
                </h3>
            </div>
        </div>
    );
}
