"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { BackButton } from "@/components/common/BackButton";

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
                redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
            },
        });
    };

    return (
        <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-background px-4">
            {/* <div className="absolute left-4 top-4 z-20">
                <BackButton showLabel className="bg-white/50 backdrop-blur-md shadow-sm" />
            </div> */}
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="z-10 w-full max-w-md"
            >
                <div className="rounded-3xl border border-white/20 bg-card/40 p-8 shadow-2xl backdrop-blur-xl md:p-12">
                    <div className="mb-10 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="relative mb-6 h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 shadow-lg"
                        >
                            <Image
                                src="/logo.png"
                                alt="Rupali Collection"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                            Rupali Collection
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
                            Premium Indian Heritage
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Welcome Back</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Sign in to access your curated collection and synchronized cart.
                            </p>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="outline"
                                type="button"
                                className="h-14 w-full rounded-2xl border-white/20 bg-white shadow-soft transition-all hover:bg-white/90 hover:shadow-lg dark:bg-zinc-900"
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading}
                            >
                                {isGoogleLoading ? (
                                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                ) : (
                                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
                                <span className="font-semibold text-white">Continue with Google</span>
                            </Button>
                        </motion.div>

                        <div className="mt-8 text-center text-xs text-muted-foreground">
                            <p>
                                By continuing, you agree to our{" "}
                                <a href="#" className="underline-offset-4 hover:text-primary hover:underline">
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="underline-offset-4 hover:text-primary hover:underline">
                                    Privacy Policy
                                </a>.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
