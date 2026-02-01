"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock signup delay
        setTimeout(() => {
            router.push("/account");
        }, 1500);
    };

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h1 className="font-serif text-3xl font-bold">Create Account</h1>
                    <p className="mt-2 text-muted-foreground">Join Rupali Collection</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Full Name
                            </label>
                            <input
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
