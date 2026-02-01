"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Heart, LogOut, Settings } from "lucide-react";

export default function AccountPage() {
    const router = useRouter();

    const handleLogout = () => {
        // Mock logout
        router.push("/login");
    };

    const menuItems = [
        { icon: Package, label: "My Orders", href: "/orders" },
        { icon: Heart, label: "Wishlist", href: "/wishlist" },
        { icon: MapPin, label: "Saved Addresses", href: "/addresses" },
        { icon: Settings, label: "Account Settings", href: "/settings" },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold">My Account</h1>
                    <p className="text-muted-foreground">Welcome back, Rupali Customer</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href="#" // Mock links stay on page or 404 for now
                        className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-6 text-center transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                    >
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Orders Stub */}
            <div className="mt-12">
                <h2 className="mb-4 font-serif text-xl font-semibold">Recent Orders</h2>
                <div className="rounded-lg border bg-muted/20 p-8 text-center text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 opacity-50 mb-2" />
                    <p>No recent orders found.</p>
                    <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-primary underline">
                        Start Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
