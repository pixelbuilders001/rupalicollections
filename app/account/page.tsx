"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
    Package,
    MapPin,
    Heart,
    LogOut,
    Settings,
    User,
    ChevronRight,
    CreditCard,
    Bell,
    Pencil
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UserProfile {
    id: string;
    email: string | undefined;
    name: string | undefined;
    avatar_url: string | undefined;
    phone: string | undefined;
}

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/login");
                return;
            }

            // Fetch generic profile data from public.profiles
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const profile = {
                id: user.id,
                email: user.email,
                name: profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Rupali Guest",
                avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
                phone: profileData?.phone_number || user.phone || user.user_metadata?.phone || ""
            };

            setUser(profile);
            setFormData({
                name: profile.name || "",
                phone: profile.phone || ""
            });
            setLoading(false);
        };

        getUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        useStore.getState().clearCart();
        router.refresh();
        router.push("/login");
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setSaving(true);

        const updates = {
            id: user.id,
            email: user.email,
            full_name: formData.name,
            phone_number: formData.phone,
            avatar_url: user.avatar_url,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (!error) {
            setUser(prev => prev ? ({ ...prev, name: formData.name, phone: formData.phone }) : null);
            setIsEditOpen(false);
        } else {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        }
        setSaving(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        }
    };

    const menuItems = [
        { icon: Package, label: "Orders", desc: "Check your order status", href: "/orders", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Heart, label: "Wishlist", desc: "Your favorite items", href: "/wishlist", color: "text-pink-600", bg: "bg-pink-50" },
        { icon: MapPin, label: "Addresses", desc: "Manage delivery addresses", href: "/addresses", color: "text-green-600", bg: "bg-green-50" },
        // { icon: CreditCard, label: "Payments", desc: "Manage payment methods", href: "/payments", color: "text-purple-600", bg: "bg-purple-50" },
        // { icon: Bell, label: "Notifications", desc: "Offers and updates", href: "/notifications", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: Settings, label: "Settings", desc: "Profile and security", href: "/settings", color: "text-slate-600", bg: "bg-slate-50" },
    ];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="animate-pulse text-sm text-muted-foreground font-serif">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/20 pb-20 pt-8 md:pb-8">
            {/* Decorative Background Blob */}
            <div className="fixed -left-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-pink-500/5 blur-3xl" />

            <div className="container relative mx-auto max-w-5xl px-4">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center justify-between"
                >
                    <div>
                        <h1 className="font-serif text-2xl font-bold text-foreground md:text-4xl">My Account</h1>
                    </div>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="sticky top-24 overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-xl backdrop-blur-xl"
                        >
                            {/* Edit Button */}
                            <div className="absolute top-4 right-4 z-10">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full bg-white/50 text-muted-foreground hover:bg-white hover:text-primary transition-colors border border-transparent hover:border-border/50 shadow-sm"
                                    onClick={() => setIsEditOpen(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>


                            <div className="relative flex flex-col items-center px-6 pb-8 pt-8 text-center">
                                <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                                    {user?.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                            <User className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h2 className="font-serif text-2xl font-bold text-gray-900">{user?.name}</h2>
                                    <p className="text-sm font-medium text-muted-foreground">{user?.email}</p>
                                    {user?.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                                </div>




                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Dashboard Grid */}
                    <div className="lg:col-span-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            {menuItems.map((item) => (
                                <motion.div key={item.label} variants={itemVariants}>
                                    <Link
                                        href={item.href}
                                        className="group relative flex h-full items-center gap-4 overflow-hidden rounded-xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
                                    >
                                        <div className={`rounded-xl p-3 shadow-inner ${item.bg} ${item.color}`}>
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{item.label}</h3>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>

                    </div>
                    <div className="mt-6 md:hidden">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="phone" className="text-right text-sm font-medium">
                                Phone
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="col-span-3"
                                placeholder="+91 00000 00000"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveChanges} disabled={saving}>
                            {saving ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
